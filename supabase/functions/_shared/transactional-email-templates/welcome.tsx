import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Preview, Text, Button, Section } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props { name?: string }

const Email = ({ name }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Welcome to Oracle Bull</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Welcome to Oracle Bull{name ? `, ${name}` : ''} 🐂</Heading>
        <Text style={text}>Thanks for joining. You now have access to AI-powered price predictions, whale alerts, and daily crypto insights.</Text>
        <Section style={{ textAlign: 'center', margin: '32px 0' }}>
          <Button href="https://oraclebull.com/dashboard" style={btn}>Open Dashboard</Button>
        </Section>
        <Text style={muted}>Trade smarter with signals grounded in real market data.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'Welcome to Oracle Bull 🐂',
  displayName: 'Welcome',
  previewData: { name: 'Trader' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container = { padding: '32px 24px', maxWidth: '560px', margin: '0 auto' }
const h1 = { color: '#0f172a', fontSize: '24px', fontWeight: 700, margin: '0 0 16px' }
const text = { color: '#334155', fontSize: '15px', lineHeight: '24px' }
const muted = { color: '#64748b', fontSize: '13px', marginTop: '24px' }
const btn = { backgroundColor: '#2563eb', color: '#ffffff', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 }