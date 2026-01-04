import { Box, Flex, Text, Grid, Card, Badge } from "@radix-ui/themes";
import { CheckIcon } from "@radix-ui/react-icons";
import { Header, Footer } from "@/components/layout";
import { Section, FieldTripMap } from "@/components/ui";
import { eventData } from "@/lib/event-data";

export default function FieldTripPage() {
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
                Field Trip
              </Text>
              <Text size="4" style={{ opacity: 0.9 }}>
                {eventData.fieldTrip.dates} • Naxos Island
              </Text>
            </Flex>
          </Section>
        </Box>

        {/* Overview */}
        <Section title="Field Trip Overview" variant="default">
          <Grid columns={{ initial: "1", md: "2" }} gap="6">
            <Box>
              <Text size="3" style={{ lineHeight: 1.8 }}>
                The 2-day field trip will explore the critical continuum between catchment dynamics
                and coastal evolution on Naxos Island. Participants will observe firsthand the
                geomorphological processes shaping this Mediterranean landscape.
              </Text>
              <Text size="3" style={{ lineHeight: 1.8, marginTop: "16px" }}>
                {eventData.fieldTrip.focus}
              </Text>
            </Box>
            <Card size="3" style={{ backgroundColor: "var(--color-primary-50)" }}>
              <Text size="4" weight="bold" mb="3" style={{ color: "var(--color-accent)", display: "block" }}>
                Key Locations
              </Text>
              <Flex direction="column" gap="2">
                {eventData.fieldTrip.locations.map((location) => (
                  <Flex key={location} gap="2" align="center">
                    <Badge color="blue" size="1">{location}</Badge>
                  </Flex>
                ))}
              </Flex>
            </Card>
          </Grid>
        </Section>

        {/* Interactive Map */}
        <Section title="Field Trip Locations" subtitle="Explore the stops on our 2-day journey" variant="muted">
          <FieldTripMap />
        </Section>

        {/* Themes */}
        <Section title="Field Trip Themes" variant="default">
          <Grid columns={{ initial: "1", sm: "2", md: "3" }} gap="4">
            {eventData.fieldTrip.themes.map((theme, index) => (
              <Card key={index} size="2">
                <Flex gap="2" align="start">
                  <Box style={{ color: "var(--color-accent)", marginTop: "2px" }}>
                    <CheckIcon width={16} height={16} />
                  </Box>
                  <Text size="2">{theme}</Text>
                </Flex>
              </Card>
            ))}
          </Grid>
        </Section>

        {/* Day by Day */}
        <Section title="Itinerary" variant="default">
          <Grid columns={{ initial: "1", md: "2" }} gap="6">
            <Card size="3">
              <Flex direction="column" gap="4">
                <Flex justify="between" align="center">
                  <Text size="5" weight="bold" style={{ color: "var(--color-accent)" }}>
                    Day 1 - October 8
                  </Text>
                  <Badge color="green">Field Trip</Badge>
                </Flex>
                <Box style={{ borderLeft: "2px solid var(--color-primary-200)", paddingLeft: "16px" }}>
                  <Flex direction="column" gap="3">
                    <Box>
                      <Text size="2" style={{ color: "var(--color-gray-500)" }}>Morning</Text>
                      <Text size="3" weight="medium" style={{ display: "block" }}>
                        Departure from Naxos Town
                      </Text>
                    </Box>
                    <Box>
                      <Text size="2" style={{ color: "var(--color-gray-500)" }}>Stop 1</Text>
                      <Text size="3" weight="medium" style={{ display: "block" }}>
                        Alyko - Coastal dynamics and dune systems
                      </Text>
                    </Box>
                    <Box>
                      <Text size="2" style={{ color: "var(--color-gray-500)" }}>Stop 2</Text>
                      <Text size="3" weight="medium" style={{ display: "block" }}>
                        Laguna - Wetland processes
                      </Text>
                    </Box>
                    <Box>
                      <Text size="2" style={{ color: "var(--color-gray-500)" }}>Evening</Text>
                      <Text size="3" weight="medium" style={{ display: "block" }}>
                        Return to accommodation
                      </Text>
                    </Box>
                  </Flex>
                </Box>
              </Flex>
            </Card>

            <Card size="3">
              <Flex direction="column" gap="4">
                <Flex justify="between" align="center">
                  <Text size="5" weight="bold" style={{ color: "var(--color-accent)" }}>
                    Day 2 - October 9
                  </Text>
                  <Badge color="green">Field Trip</Badge>
                </Flex>
                <Box style={{ borderLeft: "2px solid var(--color-primary-200)", paddingLeft: "16px" }}>
                  <Flex direction="column" gap="3">
                    <Box>
                      <Text size="2" style={{ color: "var(--color-gray-500)" }}>Morning</Text>
                      <Text size="3" weight="medium" style={{ display: "block" }}>
                        Pyrgaki - Forest fire impacts and erosion
                      </Text>
                    </Box>
                    <Box>
                      <Text size="2" style={{ color: "var(--color-gray-500)" }}>Midday</Text>
                      <Text size="3" weight="medium" style={{ display: "block" }}>
                        Peritsis River - Catchment dynamics
                      </Text>
                    </Box>
                    <Box>
                      <Text size="2" style={{ color: "var(--color-gray-500)" }}>Afternoon</Text>
                      <Text size="3" weight="medium" style={{ display: "block" }}>
                        Agricultural terraces and NbS examples
                      </Text>
                    </Box>
                    <Box>
                      <Text size="2" style={{ color: "var(--color-gray-500)" }}>Evening</Text>
                      <Text size="3" weight="medium" style={{ display: "block" }}>
                        Closing and departure
                      </Text>
                    </Box>
                  </Flex>
                </Box>
              </Flex>
            </Card>
          </Grid>
        </Section>
      </main>
      <Footer />
    </>
  );
}
