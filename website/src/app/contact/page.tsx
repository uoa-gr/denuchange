import Link from "next/link";
import { Box, Flex, Text, Grid, Card, Button } from "@radix-ui/themes";
import { EnvelopeClosedIcon, ExternalLinkIcon } from "@radix-ui/react-icons";
import { Header, Footer } from "@/components/layout";
import { Section } from "@/components/ui";
import { eventData } from "@/lib/event-data";

export default function ContactPage() {
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
                Contact Us
              </Text>
              <Text size="4" style={{ opacity: 0.9 }}>
                Get in touch with the organizing committee
              </Text>
            </Flex>
          </Section>
        </Box>

        {/* Contact Information */}
        <Section title="Get in Touch" variant="default">
          <Grid columns={{ initial: "1", md: "2" }} gap="6" style={{ maxWidth: "900px", margin: "0 auto" }}>
            <Card size="4">
              <Flex direction="column" gap="4">
                <Flex align="center" gap="3">
                  <Box
                    style={{
                      backgroundColor: "var(--color-primary-50)",
                      padding: "12px",
                      borderRadius: "8px",
                      color: "var(--color-accent)",
                    }}
                  >
                    <EnvelopeClosedIcon width={24} height={24} />
                  </Box>
                  <Box>
                    <Text size="2" style={{ color: "var(--color-gray-500)", display: "block" }}>
                      Email
                    </Text>
                    <Link
                      href={`mailto:${eventData.contact.email}`}
                      style={{ color: "var(--color-accent)", fontWeight: 500 }}
                    >
                      {eventData.contact.email}
                    </Link>
                  </Box>
                </Flex>

                <Box mt="4">
                  <Text size="4" weight="bold" mb="2" style={{ color: "var(--color-accent)", display: "block" }}>
                    Organizing Committee
                  </Text>
                  {eventData.committees.organizing.map((member) => (
                    <Text key={member.name} size="2" style={{ display: "block", marginBottom: "4px" }}>
                      {member.name}
                    </Text>
                  ))}
                </Box>

                <Box mt="4">
                  <Text size="4" weight="bold" mb="2" style={{ color: "var(--color-accent)", display: "block" }}>
                    Host Institution
                  </Text>
                  <Text size="2" style={{ display: "block" }}>
                    {eventData.contact.organization}
                  </Text>
                  <Text size="2" style={{ color: "var(--color-gray-600)" }}>
                    {eventData.contact.department}
                  </Text>
                </Box>
              </Flex>
            </Card>

            <Card size="4" style={{ backgroundColor: "var(--color-primary-50)" }}>
              <Flex direction="column" gap="4">
                <Text size="5" weight="bold" style={{ color: "var(--color-accent)" }}>
                  Quick Links
                </Text>
                
                <Flex direction="column" gap="3">
                  <Button asChild variant="soft" color="blue" size="3">
                    <Link href={eventData.registration.formUrl} target="_blank" rel="noopener noreferrer">
                      Registration Form <ExternalLinkIcon />
                    </Link>
                  </Button>
                  
                  <Button asChild variant="soft" color="blue" size="3">
                    <Link href={`mailto:${eventData.contact.email}?subject=Abstract Submission - DENUCHANGE 2026`}>
                      Submit Abstract <EnvelopeClosedIcon />
                    </Link>
                  </Button>
                  
                  <Button asChild variant="soft" color="blue" size="3">
                    <Link href={`mailto:${eventData.contact.email}?subject=Inquiry - DENUCHANGE 2026`}>
                      General Inquiry <EnvelopeClosedIcon />
                    </Link>
                  </Button>
                </Flex>

                <Box mt="4">
                  <Text size="2" style={{ color: "var(--color-gray-600)", lineHeight: 1.6 }}>
                    For abstract submissions, please include your full name, affiliation,
                    and preferred presentation type (oral or poster) in your email.
                  </Text>
                </Box>
              </Flex>
            </Card>
          </Grid>
        </Section>

        {/* FAQ */}
        <Section title="Frequently Asked Questions" variant="muted">
          <Grid columns={{ initial: "1", md: "2" }} gap="4" style={{ maxWidth: "900px", margin: "0 auto" }}>
            <Card size="3">
              <Text size="3" weight="bold" mb="2" style={{ color: "var(--color-accent)", display: "block" }}>
                How do I get to Naxos?
              </Text>
              <Text size="2" style={{ color: "var(--color-gray-600)" }}>
                Naxos can be reached by ferry from Athens (Piraeus port) or by flight to Naxos Airport.
                Ferry connections are also available from other Cycladic islands.
              </Text>
            </Card>
            <Card size="3">
              <Text size="3" weight="bold" mb="2" style={{ color: "var(--color-accent)", display: "block" }}>
                Is accommodation included?
              </Text>
              <Text size="2" style={{ color: "var(--color-gray-600)" }}>
                Accommodation is not included in the registration fee. A list of recommended hotels
                will be provided to registered participants.
              </Text>
            </Card>
            <Card size="3">
              <Text size="3" weight="bold" mb="2" style={{ color: "var(--color-accent)", display: "block" }}>
                Can I attend only the workshop?
              </Text>
              <Text size="2" style={{ color: "var(--color-gray-600)" }}>
                Yes, a meeting-only registration option is available for €100, which covers the
                2-day workshop sessions only.
              </Text>
            </Card>
            <Card size="3">
              <Text size="3" weight="bold" mb="2" style={{ color: "var(--color-accent)", display: "block" }}>
                What should I bring for the field trip?
              </Text>
              <Text size="2" style={{ color: "var(--color-gray-600)" }}>
                Comfortable walking shoes, sun protection, water bottle, and appropriate clothing
                for outdoor activities. Detailed guidelines will be sent before the event.
              </Text>
            </Card>
          </Grid>
        </Section>
      </main>
      <Footer />
    </>
  );
}

