import Link from "next/link";
import { Box, Flex, Text, Grid, Button, Card } from "@radix-ui/themes";
import {
  GlobeIcon,
  RocketIcon,
  PersonIcon,
  CalendarIcon,
} from "@radix-ui/react-icons";
import { Header, Footer } from "@/components/layout";
import { Hero, Section, FeatureCard, DeadlineCard, EventCalendar } from "@/components/ui";
import { WaveDivider, CoastlineDecoration } from "@/components/ui/decorative";
import { eventData } from "@/lib/event-data";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <Hero />

        {/* Wave divider after hero */}
        <WaveDivider color="var(--color-primary-900)" flip />

        {/* Workshop Aims Section */}
        <Section
          title="Workshop Aims"
          subtitle="Bringing together geoscientists from around the world"
          variant="default"
        >
          <Grid columns={{ initial: "1", sm: "2", md: "4" }} gap="4">
            <FeatureCard
              icon={<GlobeIcon width={24} height={24} />}
              title="Global Perspectives"
              description="Study denudation processes in coastal and terrestrial environments worldwide"
            />
            <FeatureCard
              icon={<RocketIcon width={24} height={24} />}
              title="Advanced Research"
              description="Advance understanding of weathering, erosion, and mass movements"
            />
            <FeatureCard
              icon={<PersonIcon width={24} height={24} />}
              title="Collaboration"
              description="Facilitate future collaborations among geoscientists"
            />
            <FeatureCard
              icon={<CalendarIcon width={24} height={24} />}
              title="Field Experience"
              description="2-day field trip exploring Naxos Island's unique geomorphology"
            />
          </Grid>
        </Section>

        {/* Key Dates Section with Calendar */}
        <Section
          title="Key Dates"
          subtitle="Mark your calendar"
          variant="muted"
        >
          <Grid columns={{ initial: "1", md: "2" }} gap="6" style={{ maxWidth: "1000px", margin: "0 auto" }}>
            {/* Interactive Calendar */}
            <EventCalendar />

            {/* Deadline Cards */}
            <Flex direction="column" gap="4">
              {eventData.deadlines.map((deadline) => (
                <DeadlineCard
                  key={deadline.label}
                  label={deadline.label}
                  date={deadline.date}
                />
              ))}
            </Flex>
          </Grid>
        </Section>

        {/* Program Overview */}
        <Section
          title="Program Overview"
          subtitle="4 days of presentations, discussions, and field exploration"
          variant="default"
        >
          <Grid columns={{ initial: "1", md: "2" }} gap="6">
            <Card size="3">
              <Flex direction="column" gap="3">
                <Text size="5" weight="bold" style={{ color: "var(--color-accent)" }}>
                  Workshop Sessions
                </Text>
                <Text size="2" style={{ color: "var(--color-gray-600)" }}>
                  {eventData.dates.workshop}
                </Text>
                <Text size="3">
                  Two days of presentations and poster sessions, featuring research on
                  denudation processes, weathering, erosion, and mass movements from
                  around the world.
                </Text>
                <Box mt="2">
                  <Button asChild variant="soft" color="blue">
                    <Link href="/program">View Full Program</Link>
                  </Button>
                </Box>
              </Flex>
            </Card>

            <Card size="3">
              <Flex direction="column" gap="3">
                <Text size="5" weight="bold" style={{ color: "var(--color-accent)" }}>
                  Field Trip
                </Text>
                <Text size="2" style={{ color: "var(--color-gray-600)" }}>
                  {eventData.dates.fieldTrip}
                </Text>
                <Text size="3">
                  Explore Naxos Island&apos;s unique landscapes, from forest fire impacts
                  and erosion processes to coastal dynamics and Nature-based Solutions.
                </Text>
                <Box mt="2">
                  <Button asChild variant="soft" color="blue">
                    <Link href="/field-trip">Field Trip Details</Link>
                  </Button>
                </Box>
              </Flex>
            </Card>
          </Grid>
        </Section>

        {/* Coastline decoration before CTA */}
        <Box style={{ marginTop: "-20px" }}>
          <CoastlineDecoration />
        </Box>

        {/* Registration CTA */}
        <Section variant="accent">
          <Flex
            direction="column"
            align="center"
            gap="4"
            style={{ textAlign: "center" }}
          >
            <Text size="6" weight="bold" style={{ color: "var(--color-accent)" }}>
              Ready to Join Us?
            </Text>
            <Text size="3" style={{ color: "var(--color-gray-700)", maxWidth: "600px" }}>
              Register now to secure your spot at the IAG DENUCHANGE Workshop 2026
              in beautiful Naxos, Greece.
            </Text>
            <Flex gap="4" mt="2">
              <Button asChild size="4" color="blue">
                <Link href="/registration">Register Now</Link>
              </Button>
              <Button asChild size="4" variant="outline" color="blue">
                <Link href="/contact">Contact Us</Link>
              </Button>
            </Flex>
          </Flex>
        </Section>
      </main>
      <Footer />
    </>
  );
}
