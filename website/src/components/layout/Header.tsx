"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Box, Flex, Text, Container, Button } from "@radix-ui/themes";
import { HamburgerMenuIcon, Cross1Icon } from "@radix-ui/react-icons";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/program", label: "Program" },
  { href: "/registration", label: "Registration" },
  { href: "/field-trip", label: "Field Trip" },
  { href: "/travel", label: "Travel" },
  { href: "/committees", label: "Committees" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <Box
      asChild
      style={{
        backgroundColor: "var(--color-primary-900)",
        position: "sticky",
        top: 0,
        zIndex: 50,
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      }}
    >
      <header>
        <Container size="4" px="4">
          <Flex justify="between" align="center" py="3">
            {/* Logo / Title */}
            <Link href="/" style={{ textDecoration: "none" }}>
              <Flex align="center" gap="3">
                <Image
                  src="/images/logo-denuchange.jpg"
                  alt="DENUCHANGE Logo"
                  width={40}
                  height={40}
                  style={{ borderRadius: "4px" }}
                />
                <Flex direction="column" gap="0">
                  <Text size="3" weight="bold" style={{ color: "white" }}>
                    IAG DENUCHANGE
                  </Text>
                  <Text size="1" style={{ color: "var(--color-primary-300)", opacity: 0.9 }}>
                    Naxos 2026
                  </Text>
                </Flex>
              </Flex>
            </Link>

            {/* Desktop Navigation */}
            <Flex gap="5" display={{ initial: "none", md: "flex" }} align="center">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    color: "rgba(255,255,255,0.9)",
                    textDecoration: "none",
                    fontSize: "14px",
                    fontWeight: 500,
                    transition: "color 0.2s",
                    padding: "6px 2px",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.9)")}
                >
                  {link.label}
                </Link>
              ))}
              {/* CTA in nav */}
              <Button
                asChild
                size="2"
                style={{
                  backgroundColor: "var(--color-accent-500)",
                  color: "white",
                  marginLeft: "8px",
                }}
              >
                <Link href="/registration">Register</Link>
              </Button>
            </Flex>

            {/* Mobile Menu Button */}
            <Box display={{ initial: "block", md: "none" }}>
              <Button
                variant="ghost"
                size="2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                style={{ color: "white" }}
              >
                {mobileMenuOpen ? <Cross1Icon /> : <HamburgerMenuIcon />}
              </Button>
            </Box>
          </Flex>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <Box
              display={{ initial: "block", md: "none" }}
              pb="4"
              style={{ borderTop: "1px solid rgba(255,255,255,0.15)" }}
            >
              <Flex direction="column" gap="1" pt="3">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      color: "rgba(255,255,255,0.9)",
                      textDecoration: "none",
                      fontSize: "15px",
                      fontWeight: 500,
                      padding: "10px 0",
                      borderBottom: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
                <Button
                  asChild
                  size="3"
                  style={{
                    backgroundColor: "var(--color-accent-500)",
                    color: "white",
                    marginTop: "12px",
                  }}
                >
                  <Link href="/registration" onClick={() => setMobileMenuOpen(false)}>
                    Register Now
                  </Link>
                </Button>
              </Flex>
            </Box>
          )}
        </Container>
      </header>
    </Box>
  );
}
