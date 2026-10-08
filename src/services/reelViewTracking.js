import reelService from './reelService';

const trackedReelIds = new Set();
const inFlight = new Map();

export function trackReelViewOnce(reelId) {
  if (!reelId || trackedReelIds.has(reelId)) return Promise.resolve();
  if (inFlight.has(reelId)) return inFlight.get(reelId);

  const request = reelService.trackView(reelId)
    .then(() => { trackedReelIds.add(reelId); })
    .finally(() => { inFlight.delete(reelId); });
  inFlight.set(reelId, request);
  return request;
}
