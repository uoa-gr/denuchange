import { Box, Flex, Text, Grid, Card, Badge } from "@radix-ui/themes";
import { Header, Footer } from "@/components/layout";
import { Section } from "@/components/ui";
import { eventData } from "@/lib/event-data";

export default function ProgramPage() {
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
                Program
              </Text>
              <Text size="4" style={{ opacity: 0.9 }}>
                {eventData.dates.full}
              </Text>
            </Flex>
          </Section>
        </Box>

        {/* Program Overview */}
        <Section title="Workshop Schedule" variant="default">
          <Text size="3" style={{ textAlign: "center", marginBottom: "32px", color: "var(--color-gray-600)" }}>
            Detailed program will be announced after abstract review
          </Text>
          
          <Grid columns={{ initial: "1", md: "2" }} gap="6">
            {/* Day 1 */}
            <Card size="3">
              <Flex direction="column" gap="4">
                <Flex justify="between" align="center">
                  <Text size="5" weight="bold" style={{ color: "var(--color-accent)" }}>
                    Day 1 - October 6
                  </Text>
                  <Badge color="blue">Workshop</Badge>
                </Flex>
                <Box style={{ borderLeft: "2px solid var(--color-primary-200)", paddingLeft: "16px" }}>
                  <Flex direction="column" gap="3">
                    <Box>
                      <Text size="2" style={{ color: "var(--color-gray-500)" }}>09:00 - 09:30</Text>
                      <Text size="3" weight="medium" style={{ display: "block" }}>Registration & Welcome Coffee</Text>
                    </Box>
                    <Box>
                      <Text size="2" style={{ color: "var(--color-gray-500)" }}>09:30 - 10:00</Text>
                      <Text size="3" weight="medium" style={{ display: "block" }}>Opening Ceremony</Text>
                    </Box>
                    <Box>
                      <Text size="2" style={{ color: "var(--color-gray-500)" }}>10:00 - 12:30</Text>
                      <Text size="3" weight="medium" style={{ display: "block" }}>Oral Presentations - Session 1</Text>
                    </Box>
                    <Box>
                      <Text size="2" style={{ color: "var(--color-gray-500)" }}>12:30 - 14:00</Text>
                      <Text size="3" weight="medium" style={{ display: "block" }}>Lunch Break</Text>
                    </Box>
                    <Box>
                      <Text size="2" style={{ color: "var(--color-gray-500)" }}>14:00 - 16:00</Text>
                      <Text size="3" weight="medium" style={{ display: "block" }}>Oral Presentations - Session 2</Text>
                    </Box>
                    <Box>
                      <Text size="2" style={{ color: "var(--color-gray-500)" }}>16:00 - 18:00</Text>
                      <Text size="3" weight="medium" style={{ display: "block" }}>Poster Session</Text>
                    </Box>
                  </Flex>
                </Box>
              </Flex>
            </Card>

            {/* Day 2 */}
            <Card size="3">
              <Flex direction="column" gap="4">
                <Flex justify="between" align="center">
                  <Text size="5" weight="bold" style={{ color: "var(--color-accent)" }}>
                    Day 2 - October 7
                  </Text>
                  <Badge color="blue">Workshop</Badge>
                </Flex>
                <Box style={{ borderLeft: "2px solid var(--color-primary-200)", paddingLeft: "16px" }}>
                  <Flex direction="column" gap="3">
                    <Box>
                      <Text size="2" style={{ color: "var(--color-gray-500)" }}>09:00 - 12:30</Text>
                      <Text size="3" weight="medium" style={{ display: "block" }}>Oral Presentations - Session 3</Text>
                    </Box>
                    <Box>
                      <Text size="2" style={{ color: "var(--color-gray-500)" }}>12:30 - 14:00</Text>
                      <Text size="3" weight="medium" style={{ display: "block" }}>Lunch Break</Text>
                    </Box>
                    <Box>
                      <Text size="2" style={{ color: "var(--color-gray-500)" }}>14:00 - 16:00</Text>
                      <Text size="3" weight="medium" style={{ display: "block" }}>Oral Presentations - Session 4</Text>
                    </Box>
                    <Box>
                      <Text size="2" style={{ color: "var(--color-gray-500)" }}>16:00 - 17:00</Text>
                      <Text size="3" weight="medium" style={{ display: "block" }}>Closing Discussion</Text>
                    </Box>
                    <Box>
                      <Text size="2" style={{ color: "var(--color-gray-500)" }}>20:00</Text>
                      <Text size="3" weight="medium" style={{ display: "block" }}>Workshop Dinner</Text>
                    </Box>
                  </Flex>
                </Box>
              </Flex>
            </Card>
          </Grid>
        </Section>

        {/* Abstract Submission */}
        <Section title="Abstract Submission" variant="muted">
          <Grid columns={{ initial: "1", md: "2" }} gap="6">
            <Card size="3">
              <Text size="4" weight="bold" mb="3" style={{ color: "var(--color-accent)", display: "block" }}>
                Submission Guidelines
              </Text>
              <Flex direction="column" gap="2">
                <Text size="2">• Maximum {eventData.abstractSubmission.wordLimit} words</Text>
                <Text size="2">• Language: {eventData.abstractSubmission.language}</Text>
                <Text size="2">• Format: {eventData.abstractSubmission.format}</Text>
                <Text size="2">• File naming: {eventData.abstractSubmission.fileNaming}</Text>
                <Text size="2">• Presentation types: {eventData.abstractSubmission.presentationTypes.join(" or ")}</Text>
              </Flex>
            </Card>
            <Card size="3">
              <Text size="4" weight="bold" mb="3" style={{ color: "var(--color-accent)", display: "block" }}>
                Submit To
              </Text>
              <Text size="3" mb="2" style={{ display: "block" }}>
                Send your abstract to:
              </Text>
              <Text size="3" weight="bold" style={{ color: "var(--color-primary-600)" }}>
                {eventData.contact.email}
              </Text>
              <Text size="2" mt="4" style={{ color: "var(--color-gray-600)", display: "block" }}>
                Deadline: {eventData.deadlines[0].date}
              </Text>
            </Card>
          </Grid>
        </Section>
      </main>
      <Footer />
    </>
  );
}

