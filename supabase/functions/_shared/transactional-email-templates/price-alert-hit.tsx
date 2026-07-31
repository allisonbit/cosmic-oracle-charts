import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Preview, Text, Button, Section } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  symbol?: string
  direction?: 'above' | 'below'
  targetPrice?: number | string
  currentPrice?: number | string
}

const fmt = (v: unknown) =>
  typeof v === 'number' ? `$${v.toLocaleString(undefined, { maximumFractionDigits: 6 })}` : String(v ?? '—')

const Email = ({ symbol = 'BTC', direction = 'above', targetPrice, currentPrice }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{`${symbol} crossed ${direction} ${fmt(targetPrice)}`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>🚨 {symbol} price alert</Heading>
        <Text style={text}>
          {symbol} just moved {direction} your target of <strong>{fmt(targetPrice)}</strong>.
        </Text>
        <Section style={card}>
          <Text style={label}>Current price</Text>
          <Text style={value}>{fmt(currentPrice)}</Text>
        </Section>
        <Section style={{ textAlign: 'center', margin: '28px 0' }}>
          <Button href={`https://oraclebull.com/price-prediction/${String(symbol).toLowerCase()}/daily`} style={btn}>
            View AI forecast
          </Button>
        </Section>
        <Text style={muted}>You set this alert on Oracle Bull. Manage alerts in your dashboard.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (d: Props) => `${d?.symbol ?? 'Price'} alert · ${d?.direction ?? 'crossed'} ${fmt(d?.targetPrice)}`,
  displayName: 'Price Alert Hit',
  previewData: { symbol: 'BTC', direction: 'above', targetPrice: 100000, currentPrice: 100420 },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container = { padding: '32px 24px', maxWidth: '560px', margin: '0 auto' }
const h1 = { color: '#0f172a', fontSize: '22px', fontWeight: 700, margin: '0 0 16px' }
const text = { color: '#334155', fontSize: '15px', lineHeight: '24px' }
const card = { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', margin: '20px 0' }
const label = { color: '#64748b', fontSize: '12px', textTransform: 'uppercase' as const, margin: 0 }
const value = { color: '#0f172a', fontSize: '20px', fontWeight: 700, margin: '4px 0 0' }
const muted = { color: '#64748b', fontSize: '13px', marginTop: '24px' }
const btn = { backgroundColor: '#2563eb', color: '#ffffff', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 }