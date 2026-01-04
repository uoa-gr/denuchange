import { Box, Container, Text } from "@radix-ui/themes";
import { ReactNode } from "react";

interface SectionProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  variant?: "default" | "muted" | "accent";
  id?: string;
}

export function Section({
  children,
  title,
  subtitle,
  variant = "default",
  id,
}: SectionProps) {
  const backgrounds = {
    default: "var(--color-white)",
    muted: "var(--color-gray-50)",
    accent: "var(--color-primary-50)",
  };

  return (
    <Box
      asChild
      id={id}
      style={{
        backgroundColor: backgrounds[variant],
      }}
    >
      <section>
        <Container size="4" px="4" py={{ initial: "6", md: "8" }}>
          {(title || subtitle) && (
            <Box mb="6" style={{ textAlign: "center" }}>
              {title && (
                <Text
                  size={{ initial: "6", md: "7" }}
                  weight="bold"
                  style={{
                    color: "var(--color-accent)",
                    display: "block",
                  }}
                >
                  {title}
                </Text>
              )}
              {subtitle && (
                <Text
                  size="3"
                  style={{
                    color: "var(--color-gray-600)",
                    display: "block",
                    marginTop: "8px",
                  }}
                >
                  {subtitle}
                </Text>
              )}
            </Box>
          )}
          {children}
        </Container>
      </section>
    </Box>
  );
}

