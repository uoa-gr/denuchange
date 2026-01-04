import { Box, Flex, Text, Card } from "@radix-ui/themes";
import { ClockIcon } from "@radix-ui/react-icons";

interface DeadlineCardProps {
  label: string;
  date: string;
  isPast?: boolean;
}

export function DeadlineCard({ label, date, isPast = false }: DeadlineCardProps) {
  return (
    <Card
      size="2"
      style={{
        opacity: isPast ? 0.6 : 1,
        borderLeft: isPast ? "3px solid var(--color-gray-400)" : "3px solid var(--color-accent)",
      }}
    >
      <Flex align="center" gap="3">
        <Box
          style={{
            color: isPast ? "var(--color-gray-400)" : "var(--color-accent)",
          }}
        >
          <ClockIcon width={20} height={20} />
        </Box>
        <Box>
          <Text
            size="2"
            weight="medium"
            style={{
              color: isPast ? "var(--color-gray-500)" : "var(--color-gray-900)",
              display: "block",
            }}
          >
            {label}
          </Text>
          <Text
            size="3"
            weight="bold"
            style={{
              color: isPast ? "var(--color-gray-400)" : "var(--color-accent)",
            }}
          >
            {date}
          </Text>
        </Box>
      </Flex>
    </Card>
  );
}

