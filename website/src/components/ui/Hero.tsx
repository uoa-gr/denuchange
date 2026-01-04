import Link from "next/link";
import Image from "next/image";
import { Box, Flex, Text, Container, Button } from "@radix-ui/themes";
import { CalendarIcon, GlobeIcon } from "@radix-ui/react-icons";
import { eventData } from "@/lib/event-data";

export function Hero() {
  return (
    <Box
      style={{
        color: "white",
        minHeight: "85vh",
        display: "flex",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background Image */}
      <Image
        src="/images/hero-naxos-aerial.jpeg"
        alt="Aerial view of Naxos coastline"
        fill
        priority
        style={{
          objectFit: "cover",
          objectPosition: "center",
        }}
      />

      {/* Dark overlay for text readability */}
      <Box
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(160deg, rgba(7, 79, 106, 0.85) 0%, rgba(7, 79, 106, 0.7) 50%, rgba(7, 79, 106, 0.6) 100%)",
          pointerEvents: "none",
        }}
      />

      <Container size="4" px="4" py="8" style={{ position: "relative", zIndex: 1 }}>
        <Flex direction="column" align="center" gap="6" style={{ textAlign: "center" }}>
          {/* Badge - using accent color for pop */}
          <Box
            style={{
              backgroundColor: "var(--color-accent-500)",
              color: "white",
              padding: "8px 20px",
              borderRadius: "20px",
              fontSize: "13px",
              fontWeight: 500,
              letterSpacing: "0.02em",
            }}
          >
            International Association of Geomorphologists
          </Box>

          {/* Main Title */}
          <Box style={{ maxWidth: "800px" }}>
            <Text
              size={{ initial: "7", md: "9" }}
              weight="bold"
              style={{ display: "block", lineHeight: 1.15, letterSpacing: "-0.02em" }}
            >
              {eventData.name}
            </Text>
            <Text
              size={{ initial: "3", md: "4" }}
              style={{
                opacity: 0.85,
                display: "block",
                marginTop: "16px",
                lineHeight: 1.5,
                maxWidth: "600px",
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              {eventData.tagline}
            </Text>
          </Box>

          {/* Event Details - cleaner styling */}
          <Flex
            gap={{ initial: "4", md: "6" }}
            direction={{ initial: "column", sm: "row" }}
            align="center"
            mt="2"
          >
            <Flex align="center" gap="2" style={{ opacity: 0.9 }}>
              <CalendarIcon width={18} height={18} />
              <Text size="3" weight="medium">
                {eventData.dates.full}
              </Text>
            </Flex>
            <Box display={{ initial: "none", sm: "block" }} style={{ width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.5)" }} />
            <Flex align="center" gap="2" style={{ opacity: 0.9 }}>
              <GlobeIcon width={18} height={18} />
              <Text size="3" weight="medium">
                {eventData.location.venue}, {eventData.location.country}
              </Text>
            </Flex>
          </Flex>

          {/* CTA Buttons - using accent color for primary action */}
          <Flex gap="4" direction={{ initial: "column", sm: "row" }} mt="4">
            <Button
              asChild
              size="4"
              style={{
                backgroundColor: "var(--color-accent-500)",
                color: "white",
                fontWeight: 600,
                padding: "0 32px",
              }}
            >
              <Link href="/registration">Register Now</Link>
            </Button>
            <Button
              asChild
              size="4"
              variant="outline"
              style={{
                borderColor: "rgba(255,255,255,0.4)",
                color: "white",
                backgroundColor: "transparent",
              }}
            >
              <Link href="/about">Learn More</Link>
            </Button>
          </Flex>

          {/* Deadline box - cleaner styling */}
          <Box
            mt="8"
            p="5"
            style={{
              backgroundColor: "rgba(255,255,255,0.08)",
              borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <Text size="2" style={{ opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "11px" }}>
              Abstract Submission Deadline
            </Text>
            <Text size="6" weight="bold" style={{ display: "block", marginTop: "4px" }}>
              {eventData.deadlines[0].date}
            </Text>
          </Box>
        </Flex>
      </Container>
    </Box>
  );
}
