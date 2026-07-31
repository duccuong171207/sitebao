import { Comment } from '../types';

const POSITIVE_COMMENT_TEMPLATES = [
  "Excellent article. Very informative analysis.",
  "Great coverage and very interesting story.",
  "The photography is excellent.",
  "Very well written and presented.",
  "Really enjoyed reading this article.",
  "Excellent reporting from Luiis David.",
  "Very useful information. Thank you for sharing.",
  "Great article, looking forward to more coverage.",
  "Very interesting analysis from the editorial team.",
  "Beautifully presented story and clean layout.",
  "Outstanding reporting with deep contextual clarity.",
  "The insights provided here are invaluable for global observers.",
  "Incredible depth of analysis. Luiis David delivers once again.",
  "Appreciate the objective tone and thorough fact-checking.",
  "First-class journalism. The visual documentation is top-notch.",
  "Thoughtful commentary without unnecessary spin.",
  "A masterful summary of a complex topic.",
  "Reading this gave me a much clearer perspective on the situation.",
  "Superb breakdown of the key economic indicators.",
  "The quote selection and expert commentary bring great balance.",
  "Lucid, crisp, and authoritative writing.",
  "Impressive speed and accuracy in covering this development.",
  "This publication consistently sets the benchmark for quality news.",
  "Fascinating reading. The implications discussed here are massive.",
  "Every paragraph is filled with useful information. Excellent work.",
  "The photo composition adds a profound editorial dimension.",
  "A timely piece that captures the essence of current global shifts.",
  "High-caliber reporting that respects the reader's time.",
  "Brilliant summary! Shared this with my colleagues immediately.",
  "Very thorough and well-researched article. Kudos to Luiis David.",
  "Remarkable clarity on what could otherwise be a confusing issue.",
  "The editorial independence of this newsroom is truly refreshing.",
  "Captivating read from start to finish.",
  "Great attention to detail and factual rigor.",
  "One of the best pieces I've read on this subject all month.",
  "Very informative and beautifully structured text.",
  "The economic perspective presented here is spot on.",
  "Compelling story, expertly articulated.",
  "Thank you for this insightful piece. Always look forward to your updates.",
  "Splendid reporting! The charts and imagery enhance the story immensely."
];

const FIRST_NAMES = [
  "Arthur", "Claire", "Marcus", "Sofia", "David", "Elena", "Jean-Luc", "Hiroshi",
  "Sarah", "Liam", "Fatima", "Alexander", "Isabella", "Mateo", "Oliver", "Emma",
  "Lucas", "Aria", "Julian", "Chloe", "Gabriel", "Mia", "Benjamin", "Charlotte",
  "Ethan", "Amara", "Sebastian", "Zoe", "Noah", "Harper", "Henry", "Evelyn",
  "Daniel", "Abigail", "Samuel", "Ella", "Matthew", "Avery", "Jackson", "Scarlett",
  "David", "Grace", "Joseph", "Chloe", "Victoria", "Logan", "Penelope", "James",
  "Hannah", "Mason", "Layla", "Dr. Robert", "Prof. Karen", "Ambassador Thomas",
  "Director Rachel", "Captain Michael", "Analyst Viktor", "Strategist Kenji"
];

const LAST_NAMES = [
  "Vance", "Sterling", "Thorne", "Rodriguez", "Kovacs", "Rossi", "Dupont", "Tanaka",
  "Jenkins", "O'Connor", "Al-Mansoor", "Wright", "Chen", "Dubois", "Lindqvist", "Novak",
  "Santamaria", "Moreau", "Fischer", "Takahashi", "Gomez", "Nakamura", "Schneider", "Mercer",
  "Gallagher", "Hassan", "Patel", "Bernstein", "Fontaine", "Sinclair", "Vanderbilt", "Blackwood",
  "Kaufman", "Abernathy", "Davenport", "Harrington", "Kensington", "Montgomery", "Prescott", "Winslow"
];

export function formatCommentTimestamp(timestampMs: number, nowMs: number = Date.now()): string {
  const commentDate = new Date(timestampMs);
  const diffMs = Math.max(0, nowMs - timestampMs);
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) {
    return 'Just now';
  }
  if (diffMins < 60) {
    return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
  }
  if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  }
  if (diffDays < 7) {
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  }

  const monthName = commentDate.toLocaleDateString('en-US', { month: 'short' });
  const day = commentDate.getDate();
  const year = commentDate.getFullYear();
  let hours = commentDate.getHours();
  const minutes = commentDate.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const minsStr = minutes < 10 ? `0${minutes}` : `${minutes}`;

  return `${monthName} ${day}, ${year} — ${hours}:${minsStr} ${ampm}`;
}

/**
 * Generates 100 to 180 positive seed comments for an article,
 * distributing their creation timestamps smoothly from the publish date up to current time.
 */
export function generateSeedCommentsForArticle(
  articleId: string, 
  count: number = 125,
  publishedAtDate?: string,
  publishedAtTime?: string
): Comment[] {
  const comments: Comment[] = [];
  const total = Math.max(100, Math.min(count, 180));

  let publishMs: number;
  if (publishedAtDate) {
    const timeStr = (publishedAtTime && publishedAtTime.trim()) ? publishedAtTime.trim() : '10:00';
    const d = new Date(`${publishedAtDate}T${timeStr}:00`);
    if (!isNaN(d.getTime())) {
      publishMs = d.getTime();
    } else {
      const d2 = new Date(publishedAtDate);
      publishMs = !isNaN(d2.getTime()) ? d2.getTime() : Date.now() - 2 * 24 * 60 * 60 * 1000;
    }
  } else {
    publishMs = Date.now() - 2 * 24 * 60 * 60 * 1000;
  }

  const nowMs = Date.now();
  if (publishMs >= nowMs) {
    publishMs = nowMs - 2 * 60 * 60 * 1000; // If publish date is future/now, start 2 hours ago
  }

  const totalRangeMs = Math.max(60000, nowMs - publishMs);

  for (let i = 0; i < total; i++) {
    // Generate segment timestamp from publish date (i=0) up to present time (i=total-1)
    const segmentStart = publishMs + (i / total) * totalRangeMs;
    const segmentEnd = publishMs + ((i + 1) / total) * totalRangeMs;
    const commentMs = segmentStart + Math.random() * (segmentEnd - segmentStart);

    const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    const authorName = `${firstName} ${lastName}`;

    const template1 = POSITIVE_COMMENT_TEMPLATES[i % POSITIVE_COMMENT_TEMPLATES.length];
    let content = template1;

    // Combine 2 templates occasionally for longer comments
    if (i % 3 === 0) {
      const template2 = POSITIVE_COMMENT_TEMPLATES[(i + 7) % POSITIVE_COMMENT_TEMPLATES.length];
      content = `${template1} ${template2}`;
    }

    const likesCount = Math.floor(Math.random() * 320) + 12;
    const timeFormatted = formatCommentTimestamp(commentMs, nowMs);

    comments.push({
      id: `c-seed-${articleId}-${i + 1}-${Math.random().toString(36).substring(2, 6)}`,
      articleId,
      authorName,
      content,
      commentType: 'seed',
      createdAt: timeFormatted,
      likes: likesCount,
      isSeed: true,
      isHidden: false
    });
  }

  // Reverse so the newest comments appear first in discussion
  comments.reverse();

  return comments;
}

