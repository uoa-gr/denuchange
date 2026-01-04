import { Box, Flex, Text, Grid, Card } from "@radix-ui/themes";
import { CheckIcon } from "@radix-ui/react-icons";
import { Header, Footer } from "@/components/layout";
import { Section } from "@/components/ui";
import { eventData } from "@/lib/event-data";

export default function AboutPage() {
  return (
    <>
      <Header />
      <main>
        {/* Page Header */}
        <Box
          style={{
            background: "linear-gradient(135deg, var(--color-accent) 0%, var(--color-primary-800) 100%)",
            color: "white",
            padding: "80px 0 60px",
          }}
        >
          <Section>
            <Flex direction="column" align="center" gap="4" style={{ textAlign: "center" }}>
              <Text size="8" weight="bold">
                About the Workshop
              </Text>
              <Text size="4" style={{ opacity: 0.9, maxWidth: "700px" }}>
                {eventData.tagline}
              </Text>
            </Flex>
          </Section>
        </Box>

        {/* About DENUCHANGE */}
        <Section title="About DENUCHANGE" variant="default">
          <Grid columns={{ initial: "1", md: "2" }} gap="6">
            <Box>
              <Text size="3" style={{ lineHeight: 1.8 }}>
                The DENUCHANGE Working Group of the International Association of Geomorphologists (IAG)
                focuses on studying denudation processes and environmental changes across different
                morphoclimatic zones worldwide.
              </Text>
              <Text size="3" style={{ lineHeight: 1.8, marginTop: "16px" }}>
                Our research encompasses weathering, erosion, and mass movements in both coastal and
                terrestrial environments, analyzing drivers, rates, diversity, and variability of these
                processes globally.
              </Text>
            </Box>
            <Card size="3">
              <Text size="4" weight="bold" mb="3" style={{ color: "var(--color-accent)", display: "block" }}>
                Workshop Aims
              </Text>
              <Flex direction="column" gap="3">
                {eventData.aims.map((aim, index) => (
                  <Flex key={index} gap="2" align="start">
                    <Box style={{ color: "var(--color-accent)", marginTop: "4px" }}>
                      <CheckIcon width={16} height={16} />
                    </Box>
                    <Text size="2">{aim}</Text>
                  </Flex>
                ))}
              </Flex>
            </Card>
          </Grid>
        </Section>

        {/* Location */}
        <Section title="Location: Naxos, Greece" variant="muted">
          <Grid columns={{ initial: "1", md: "2" }} gap="6">
            <Box>
              <Text size="3" style={{ lineHeight: 1.8 }}>
                Naxos is the largest island of the Cyclades in the Aegean Sea, Greece. Known for its
                diverse landscapes, the island offers an exceptional natural laboratory for studying
                geomorphological processes.
              </Text>
              <Text size="3" style={{ lineHeight: 1.8, marginTop: "16px" }}>
                From its mountainous interior to its coastal zones, Naxos presents unique opportunities
                to observe land degradation, erosion processes, and the impacts of climate change on
                Mediterranean landscapes.
              </Text>
            </Box>
            <Card size="3" style={{ backgroundColor: "var(--color-primary-50)" }}>
              <Text size="4" weight="bold" mb="3" style={{ color: "var(--color-accent)", display: "block" }}>
                Why Naxos?
              </Text>
              <Flex direction="column" gap="2">
                <Text size="2">• Diverse geomorphological features</Text>
                <Text size="2">• Mediterranean climate zone</Text>
                <Text size="2">• Evidence of forest fire impacts</Text>
                <Text size="2">• Coastal and catchment dynamics</Text>
                <Text size="2">• Agricultural terraces and traditional land management</Text>
                <Text size="2">• Accessible field sites</Text>
              </Flex>
            </Card>
          </Grid>
        </Section>

        {/* Event Details */}
        <Section title="Event Details" variant="default">
          <Grid columns={{ initial: "1", sm: "2", md: "3" }} gap="4">
            <Card size="3">
              <Text size="4" weight="bold" style={{ color: "var(--color-accent)", display: "block" }}>
                Workshop Sessions
              </Text>
              <Text size="5" weight="bold" mt="2" style={{ display: "block" }}>
                {eventData.dates.workshop}
              </Text>
              <Text size="2" mt="2" style={{ color: "var(--color-gray-600)" }}>
                Oral and poster presentations
              </Text>
            </Card>
            <Card size="3">
              <Text size="4" weight="bold" style={{ color: "var(--color-accent)", display: "block" }}>
                Field Trip
              </Text>
              <Text size="5" weight="bold" mt="2" style={{ display: "block" }}>
                {eventData.dates.fieldTrip}
              </Text>
              <Text size="2" mt="2" style={{ color: "var(--color-gray-600)" }}>
                2-day excursion around Naxos
              </Text>
            </Card>
            <Card size="3">
              <Text size="4" weight="bold" style={{ color: "var(--color-accent)", display: "block" }}>
                Venue
              </Text>
              <Text size="5" weight="bold" mt="2" style={{ display: "block" }}>
                {eventData.location.venue}
              </Text>
              <Text size="2" mt="2" style={{ color: "var(--color-gray-600)" }}>
                {eventData.location.region}
              </Text>
            </Card>
          </Grid>
        </Section>
      </main>
      <Footer />
    </>
  );
}

