import { Box, Flex, Text, Card } from "@radix-ui/themes";
import { ReactNode } from "react";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <Card size="3" style={{ height: "100%" }}>
      <Flex direction="column" gap="3">
        <Box
          style={{
            color: "var(--color-accent)",
            width: "48px",
            height: "48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "var(--color-primary-50)",
            borderRadius: "8px",
          }}
        >
          {icon}
        </Box>
        <Text size="4" weight="bold" style={{ color: "var(--color-gray-900)" }}>
          {title}
        </Text>
        <Text size="2" style={{ color: "var(--color-gray-600)" }}>
          {description}
        </Text>
      </Flex>
    </Card>
  );
}

