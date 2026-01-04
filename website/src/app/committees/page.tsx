import { Box, Flex, Text, Grid, Card, Avatar } from "@radix-ui/themes";
import { PersonIcon } from "@radix-ui/react-icons";
import { Header, Footer } from "@/components/layout";
import { Section } from "@/components/ui";
import { eventData } from "@/lib/event-data";

export default function CommitteesPage() {
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
                Committees
              </Text>
              <Text size="4" style={{ opacity: 0.9 }}>
                Meet the organizing and scientific committees
              </Text>
            </Flex>
          </Section>
        </Box>

        {/* Organizing Committee */}
        <Section title="Organizing Committee" variant="default">
          <Grid columns={{ initial: "1", sm: "2", md: "3" }} gap="4">
            {eventData.committees.organizing.map((member) => (
              <Card key={member.name} size="3">
                <Flex direction="column" align="center" gap="3" style={{ textAlign: "center" }}>
                  <Avatar
                    size="6"
                    fallback={<PersonIcon width={32} height={32} />}
                    style={{ backgroundColor: "var(--color-primary-100)" }}
                  />
                  <Box>
                    <Text size="4" weight="bold" style={{ display: "block", color: "var(--color-accent)" }}>
                      {member.name}
                    </Text>
                    <Text size="2" style={{ color: "var(--color-gray-600)" }}>
                      {member.affiliation}
                    </Text>
                  </Box>
                </Flex>
              </Card>
            ))}
          </Grid>
        </Section>

        {/* Scientific Committee */}
        <Section title="Scientific Committee" variant="muted">
          <Grid columns={{ initial: "1", sm: "2", md: "3" }} gap="4">
            {eventData.committees.scientific.map((member) => (
              <Card key={member.name} size="3">
                <Flex direction="column" align="center" gap="3" style={{ textAlign: "center" }}>
                  <Avatar
                    size="6"
                    fallback={<PersonIcon width={32} height={32} />}
                    style={{ backgroundColor: "var(--color-primary-100)" }}
                  />
                  <Box>
                    <Text size="4" weight="bold" style={{ display: "block", color: "var(--color-accent)" }}>
                      {member.name}
                    </Text>
                    <Text size="2" style={{ color: "var(--color-gray-600)" }}>
                      {member.affiliation}
                    </Text>
                  </Box>
                </Flex>
              </Card>
            ))}
          </Grid>
        </Section>

        {/* Host Institution */}
        <Section title="Host Institution" variant="default">
          <Card size="4" style={{ maxWidth: "600px", margin: "0 auto" }}>
            <Flex direction="column" align="center" gap="4" style={{ textAlign: "center" }}>
              <Text size="5" weight="bold" style={{ color: "var(--color-accent)" }}>
                {eventData.contact.organization}
              </Text>
              <Text size="3" style={{ color: "var(--color-gray-600)" }}>
                {eventData.contact.department}
              </Text>
              <Text size="2" style={{ lineHeight: 1.8, maxWidth: "500px" }}>
                The National and Kapodistrian University of Athens is the oldest university in Greece
                and one of the most prestigious in Europe. The Department of Geology and Geoenvironment
                has a long tradition in geomorphological research.
              </Text>
            </Flex>
          </Card>
        </Section>
      </main>
      <Footer />
    </>
  );
}

