/**
 * Smart Matching Engine for LostLink
 * Compares lost and found items across category, brand, color, location, date, and description.
 */

const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'as',
  'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'could',
  'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had',
  'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how',
  'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'just', 'me', 'more', 'most', 'my', 'myself',
  'no', 'nor', 'not', 'now', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'our', 'ours',
  'ourselves', 'out', 'over', 'own', 'same', 'she', 'should', 'so', 'some', 'such', 'than', 'that',
  'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they', 'this', 'those',
  'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what', 'when',
  'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'would', 'you', 'your', 'yours', 'yourself',
]);

const tokenize = (text) => {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
};

const textSimilarity = (textA, textB) => {
  const wordsA = new Set(tokenize(textA));
  const wordsB = new Set(tokenize(textB));

  if (wordsA.size === 0 || wordsB.size === 0) return 0;

  let intersection = 0;
  for (const word of wordsA) {
    if (wordsB.has(word)) intersection++;
  }

  const union = new Set([...wordsA, ...wordsB]).size;
  return union > 0 ? intersection / union : 0;
};

const normalizeColor = (color) => {
  if (!color) return '';
  const c = color.toLowerCase().trim();
  if (c.includes('black') || c.includes('dark')) return 'black';
  if (c.includes('white') || c.includes('cream')) return 'white';
  if (c.includes('gray') || c.includes('grey') || c.includes('silver')) return 'gray/silver';
  if (c.includes('blue') || c.includes('navy')) return 'blue';
  if (c.includes('red') || c.includes('maroon') || c.includes('burgundy')) return 'red';
  if (c.includes('gold') || c.includes('yellow')) return 'gold/yellow';
  if (c.includes('green')) return 'green';
  if (c.includes('brown') || c.includes('tan')) return 'brown';
  return c;
};

const calculateMatchScore = (itemA, itemB) => {
  let lost = itemA.type === 'lost' ? itemA : itemB;
  let found = itemA.type === 'found' ? itemA : itemB;

  const reasons = [];

  // 1. Category (Weight: 25%)
  let categoryScore = 0;
  if (itemA.category && itemB.category && itemA.category === itemB.category) {
    categoryScore = 25;
    reasons.push(`Exact category match (${itemA.category})`);
  } else if (itemA.category === 'Other' || itemB.category === 'Other') {
    categoryScore = 8;
  }

  // 2. Brand (Weight: 15%)
  let brandScore = 0;
  const brandA = (itemA.brand || '').toLowerCase().trim();
  const brandB = (itemB.brand || '').toLowerCase().trim();

  if (brandA && brandB) {
    if (brandA === brandB) {
      brandScore = 15;
      reasons.push(`Matching brand (${itemA.brand})`);
    } else if (brandA.includes(brandB) || brandB.includes(brandA)) {
      brandScore = 12;
      reasons.push(`Similar brand reference (${itemA.brand} / ${itemB.brand})`);
    }
  } else if (!brandA && !brandB) {
    brandScore = 8;
  } else {
    const specified = brandA || brandB;
    const otherText = `${itemA.title} ${itemA.description} ${itemB.title} ${itemB.description}`.toLowerCase();
    if (otherText.includes(specified)) {
      brandScore = 11;
      reasons.push(`Brand "${specified}" referenced in report`);
    } else {
      brandScore = 4;
    }
  }

  // 3. Color (Weight: 15%)
  let colorScore = 0;
  const colorA1 = normalizeColor(itemA.primaryColor);
  const colorB1 = normalizeColor(itemB.primaryColor);
  const colorA2 = normalizeColor(itemA.secondaryColor);
  const colorB2 = normalizeColor(itemB.secondaryColor);

  if (colorA1 && colorB1 && colorA1 === colorB1) {
    colorScore = 15;
    reasons.push(`Primary color matches (${itemA.primaryColor})`);
  } else if (
    (colorA1 && colorB2 && colorA1 === colorB2) ||
    (colorA2 && colorB1 && colorA2 === colorB1)
  ) {
    colorScore = 11;
    reasons.push(`Color accent matches`);
  } else if (colorA2 && colorB2 && colorA2 === colorB2) {
    colorScore = 8;
  } else {
    const textAll = `${itemA.title} ${itemA.description} ${itemB.title} ${itemB.description}`.toLowerCase();
    if (colorA1 && textAll.includes(colorA1)) {
      colorScore = 7;
    }
  }

  // 4. Location (Weight: 20%)
  let locationScore = 0;
  const cityA = (itemA.location?.city || '').toLowerCase().trim();
  const cityB = (itemB.location?.city || '').toLowerCase().trim();

  if (cityA && cityB && cityA === cityB) {
    locationScore += 12;
    reasons.push(`Same city (${itemA.location.city})`);

    const specA = itemA.location?.specificLocation || '';
    const specB = itemB.location?.specificLocation || '';
    const locSim = textSimilarity(specA, specB);
    if (locSim > 0.2) {
      locationScore += 8;
      reasons.push(`Similar location details`);
    } else if (locSim > 0) {
      locationScore += 5;
    } else {
      locationScore += 2;
    }
  } else {
    if (cityA && (itemB.description || '').toLowerCase().includes(cityA)) {
      locationScore += 6;
    } else if (cityB && (itemA.description || '').toLowerCase().includes(cityB)) {
      locationScore += 6;
    }
  }

  // 5. Date Proximity (Weight: 10%)
  let dateScore = 0;
  if (lost.date && found.date) {
    const lostDate = new Date(lost.date);
    const foundDate = new Date(found.date);
    const diffDays = Math.round((foundDate - lostDate) / (1000 * 60 * 60 * 24));

    if (diffDays >= 0 && diffDays <= 3) {
      dateScore = 10;
      reasons.push(`Found within 3 days of being lost`);
    } else if (diffDays > 3 && diffDays <= 7) {
      dateScore = 8.5;
      reasons.push(`Found within 1 week of being lost`);
    } else if (diffDays > 7 && diffDays <= 14) {
      dateScore = 7;
      reasons.push(`Found within 2 weeks of being lost`);
    } else if (diffDays > 14 && diffDays <= 30) {
      dateScore = 5;
    } else if (diffDays > 30 && diffDays <= 90) {
      dateScore = 3;
    } else if (diffDays < 0 && diffDays >= -3) {
      dateScore = 3;
    }
  } else {
    dateScore = 4;
  }

  // 6. Title and Description Overlap (Weight: 15%)
  const fullTextA = `${itemA.title} ${itemA.description}`;
  const fullTextB = `${itemB.title} ${itemB.description}`;
  const sim = textSimilarity(fullTextA, fullTextB);
  let descriptionScore = Math.min(15, Math.round(sim * 35));
  if (descriptionScore > 8) {
    reasons.push(`High description keyword overlap`);
  }

  const totalScore = Math.min(
    100,
    Math.round(
      categoryScore +
      brandScore +
      colorScore +
      locationScore +
      dateScore +
      descriptionScore
    )
  );

  return {
    score: totalScore,
    breakdown: {
      categoryScore: Math.round(categoryScore),
      brandScore: Math.round(brandScore),
      colorScore: Math.round(colorScore),
      locationScore: Math.round(locationScore),
      dateScore: Math.round(dateScore),
      descriptionScore: Math.round(descriptionScore),
    },
    reasons,
  };
};

module.exports = {
  calculateMatchScore,
  textSimilarity,
  normalizeColor,
};
