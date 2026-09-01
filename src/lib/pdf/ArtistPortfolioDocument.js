import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import { htmlToPlainText } from "./htmlToPlainText";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: "#F5F5F5",
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 24,
    borderBottomWidth: 2,
    borderBottomColor: "#3AAFE0",
    paddingBottom: 16,
  },
  stageName: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  genreBadges: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  genreBadge: {
    fontSize: 10,
    fontWeight: "bold",
    backgroundColor: "#3AAFE0",
    color: "#FFFFFF",
    padding: 4,
    paddingHorizontal: 8,
    borderRadius: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#3AAFE0",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  bio: {
    fontSize: 11,
    lineHeight: 1.6,
    color: "#333333",
    textAlign: "justify",
  },
  bioBlock: {
    marginBottom: 10,
  },
  socialLinksList: {
    flexDirection: "column",
  },
  socialLinkItem: {
    fontSize: 10,
    color: "#3AAFE0",
    marginBottom: 4,
    fontWeight: "bold",
  },
  tracksList: {
    flexDirection: "column",
  },
  trackItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    paddingBottom: 6,
    marginBottom: 6,
  },
  trackTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#1A1A1A",
    flex: 1,
  },
  trackPlatform: {
    fontSize: 9,
    color: "#666666",
    backgroundColor: "#F0F0F0",
    padding: 3,
    paddingHorizontal: 6,
  },
  eventsTable: {
    flexDirection: "column",
  },
  eventsTableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    paddingBottom: 6,
    marginBottom: 6,
  },
  eventsTableHeader: {
    flexDirection: "row",
    borderBottomWidth: 2,
    borderBottomColor: "#3AAFE0",
    paddingBottom: 8,
    marginBottom: 8,
    fontWeight: "bold",
  },
  eventsTableHeaderCell: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#3AAFE0",
    textTransform: "uppercase",
    flex: 1,
  },
  eventsTableCell: {
    fontSize: 10,
    color: "#333333",
    flex: 1,
  },
  eventDateCell: {
    fontSize: 10,
    color: "#1A1A1A",
    fontWeight: "bold",
    flex: 1,
  },
  footer: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    fontSize: 9,
    color: "#666666",
    textAlign: "center",
  },
  emptyState: {
    fontSize: 10,
    color: "#999999",
    fontStyle: "italic",
  },
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  year: "numeric",
});

export function ArtistPortfolioDocument({ artist }) {
  if (!artist) return null;

  const bioPlainText = htmlToPlainText(artist.bio);
  const bioParagraphs = bioPlainText
    .split("\n")
    .filter((p) => p.trim().length > 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.stageName}>{artist.stageName}</Text>
          {artist.genres && artist.genres.length > 0 && (
            <View style={styles.genreBadges}>
              {artist.genres.map((genre) => (
                <Text key={genre} style={styles.genreBadge}>
                  {genre.toUpperCase()}
                </Text>
              ))}
            </View>
          )}
        </View>

        {/* Bio */}
        {bioPlainText && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Bio</Text>
            {bioParagraphs.map((paragraph, idx) => (
              <View key={idx} style={styles.bioBlock}>
                <Text style={styles.bio}>{paragraph}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Social Links */}
        {artist.socialLinks && Object.keys(artist.socialLinks).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Social Links</Text>
            <View style={styles.socialLinksList}>
              {Object.entries(artist.socialLinks).map(([platform, url]) => (
                <Text key={platform} style={styles.socialLinkItem}>
                  {platform.toUpperCase()}: {url}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Featured Tracks */}
        {artist.featuredTracks && artist.featuredTracks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Featured Tracks</Text>
            <View style={styles.tracksList}>
              {artist.featuredTracks.map((track) => (
                <View key={track.title} style={styles.trackItem}>
                  <Text style={styles.trackTitle}>{track.title}</Text>
                  <Text style={styles.trackPlatform}>{track.platform}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Upcoming Events */}
        {artist.upcomingEvents && artist.upcomingEvents.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Upcoming Events</Text>
            <View style={styles.eventsTable}>
              <View style={styles.eventsTableHeader}>
                <Text style={styles.eventsTableHeaderCell}>Date</Text>
                <Text style={styles.eventsTableHeaderCell}>Venue</Text>
                <Text style={styles.eventsTableHeaderCell}>City</Text>
              </View>
              {artist.upcomingEvents.map((event) => (
                <View key={event.title} style={styles.eventsTableRow}>
                  <Text style={styles.eventDateCell}>
                    {dateFormatter.format(new Date(event.date))}
                  </Text>
                  <Text style={styles.eventsTableCell}>{event.venue}</Text>
                  <Text style={styles.eventsTableCell}>{event.city}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Portfolio exported from Midwave Productions</Text>
        </View>
      </Page>
    </Document>
  );
}
