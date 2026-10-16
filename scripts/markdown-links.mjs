export const MARKDOWN_LINK = /\[[^\]]*\]\(([^)\s]+)\)/gu;
export const EXTERNAL_LINK = /^[a-z][a-z0-9+.-]*:/iu;

function githubSlug(heading) {
    return heading
        .replace(/\[([^\]]*)\]\([^)]*\)/gu, '$1')
        .trim()
        .toLowerCase()
        .replace(/[^\p{L}\p{M}\p{N}\p{Pc} -]/gu, '')
        .replace(/ /gu, '-');
}

export function collectAnchors(markdown) {
    const anchors = new Set();
    const occurrences = new Map();
    let inFence = false;

    for (const line of markdown.split('\n')) {
        if (/^\s*(```|~~~)/u.test(line)) {
            inFence = !inFence;
            continue;
        }
        const heading = inFence ? null : /^#{1,6}\s+(.+?)\s*#*\s*$/u.exec(line);
        if (heading) {
            const base = githubSlug(heading[1]);
            const seen = occurrences.get(base) ?? 0;
            anchors.add(seen === 0 ? base : `${base}-${seen}`);
            occurrences.set(base, seen + 1);
        }
    }

    return anchors;
}
