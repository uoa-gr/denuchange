import Link from "next/link";
import { Box, Flex, Text, Grid, Card, Button, Badge, Table } from "@radix-ui/themes";
import { CheckIcon, ExternalLinkIcon } from "@radix-ui/react-icons";
import { Header, Footer } from "@/components/layout";
import { Section } from "@/components/ui";
import { eventData } from "@/lib/event-data";

export default function RegistrationPage() {
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
                Registration
              </Text>
              <Text size="4" style={{ opacity: 0.9 }}>
                Secure your spot at the IAG DENUCHANGE Workshop 2026
              </Text>
            </Flex>
          </Section>
        </Box>

        {/* Registration Fees */}
        <Section title="Registration Fees" variant="default">
          <Box style={{ maxWidth: "800px", margin: "0 auto" }}>
            <Table.Root variant="surface">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell>Category</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Fee (EUR)</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>Includes</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {eventData.registration.fees.map((fee) => (
                  <Table.Row key={fee.type}>
                    <Table.Cell>
                      <Text weight="medium">{fee.type}</Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text size="4" weight="bold" style={{ color: "var(--color-accent)" }}>
                        €{fee.price}
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text size="2" style={{ color: "var(--color-gray-600)" }}>
                        {fee.description}
                      </Text>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>
        </Section>

        {/* What's Included */}
        <Section title="What's Included" variant="muted">
          <Grid columns={{ initial: "1", sm: "2" }} gap="4" style={{ maxWidth: "600px", margin: "0 auto" }}>
            {eventData.registration.includes.map((item, index) => (
              <Flex key={index} gap="2" align="center">
                <Box style={{ color: "var(--color-accent)" }}>
                  <CheckIcon width={20} height={20} />
                </Box>
                <Text size="3">{item}</Text>
              </Flex>
            ))}
          </Grid>
        </Section>

        {/* Register Now */}
        <Section variant="accent">
          <Flex direction="column" align="center" gap="6" style={{ textAlign: "center" }}>
            <Text size="6" weight="bold" style={{ color: "var(--color-accent)" }}>
              Ready to Register?
            </Text>
            <Text size="3" style={{ color: "var(--color-gray-700)", maxWidth: "500px" }}>
              Complete your registration using our online form. Payment details will be provided after submission.
            </Text>
            <Badge size="2" color="orange">
              Registration Deadline: {eventData.deadlines[2].date}
            </Badge>
            <Button asChild size="4" color="blue">
              <Link href={eventData.registration.formUrl} target="_blank" rel="noopener noreferrer">
                Register Now <ExternalLinkIcon />
              </Link>
            </Button>
          </Flex>
        </Section>

        {/* Important Notes */}
        <Section title="Important Information" variant="default">
          <Grid columns={{ initial: "1", md: "2" }} gap="6">
            <Card size="3">
              <Text size="4" weight="bold" mb="3" style={{ color: "var(--color-accent)", display: "block" }}>
                Payment
              </Text>
              <Text size="2" style={{ lineHeight: 1.8 }}>
                Payment instructions will be sent after registration form submission.
                Bank transfer details will be provided via email.
              </Text>
            </Card>
            <Card size="3">
              <Text size="4" weight="bold" mb="3" style={{ color: "var(--color-accent)", display: "block" }}>
                Cancellation Policy
              </Text>
              <Text size="2" style={{ lineHeight: 1.8 }}>
                Cancellations received before August 15, 2026 will receive a full refund minus
                administrative fees. No refunds after this date.
              </Text>
            </Card>
          </Grid>
        </Section>
      </main>
      <Footer />
    </>
  );
}

