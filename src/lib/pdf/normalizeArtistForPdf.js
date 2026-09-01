export function normalizeArtistForPdf(artist) {
  if (!artist) return null;

  const {
    stageName = "",
    genre = "",
    genres = [],
    bio = "",
    socialLinks = {},
    featuredTracks = [],
    upcomingEvents = [],
    profileImage = null,
    coverImage = null,
    slug = "",
  } = artist;

  const genreList = Array.isArray(genres) && genres.length > 0 ? genres : genre ? [genre] : [];

  return {
    stageName,
    genres: genreList,
    bio,
    socialLinks,
    featuredTracks,
    upcomingEvents,
    profileImage,
    coverImage,
    slug,
  };
}
