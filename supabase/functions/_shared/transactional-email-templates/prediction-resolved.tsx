import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Preview, Text, Button, Section } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  symbol?: string
  direction?: 'up' | 'down'
  predictedPrice?: number
  actualPrice?: number
  correct?: boolean
  horizon?: string
}

const fmt = (v?: number) => (typeof v === 'number' ? `$${v.toLocaleString(undefined, { maximumFractionDigits: 6 })}` : '—')

const Email = ({ symbol = 'BTC', direction, predictedPrice, actualPrice, correct, horizon }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{`${symbol} prediction resolved — ${correct ? 'correct' : 'missed'}`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>
          {correct ? '✅' : '❌'} {symbol} {horizon ?? ''} prediction resolved
        </Heading>
        <Text style={text}>
          Your forecast: <strong>{direction ?? '—'}</strong> to {fmt(predictedPrice)}.
          Actual outcome: {fmt(actualPrice)}.
        </Text>
        <Section style={correct ? cardWin : cardLoss}>
          <Text style={label}>Result</Text>
          <Text style={value}>{correct ? 'Hit target' : 'Missed target'}</Text>
        </Section>
        <Section style={{ textAlign: 'center', margin: '28px 0' }}>
          <Button href="https://oraclebull.com/accuracy" style={btn}>See leaderboard</Button>
        </Section>
        <Text style={muted}>Keep predicting — every call sharpens your track record.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (d: Props) => `${d?.symbol ?? 'Prediction'} ${d?.correct ? 'HIT' : 'missed'} · Oracle Bull`,
  displayName: 'Prediction Resolved',
  previewData: { symbol: 'ETH', direction: 'up', predictedPrice: 4200, actualPrice: 4310, correct: true, horizon: '24h' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container = { padding: '32px 24px', maxWidth: '560px', margin: '0 auto' }
const h1 = { color: '#0f172a', fontSize: '22px', fontWeight: 700, margin: '0 0 16px' }
const text = { color: '#334155', fontSize: '15px', lineHeight: '24px' }
const cardWin = { background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '10px', padding: '16px', margin: '20px 0' }
const cardLoss = { background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '16px', margin: '20px 0' }
const label = { color: '#64748b', fontSize: '12px', textTransform: 'uppercase' as const, margin: 0 }
const value = { color: '#0f172a', fontSize: '20px', fontWeight: 700, margin: '4px 0 0' }
const muted = { color: '#64748b', fontSize: '13px', marginTop: '24px' }
const btn = { backgroundColor: '#2563eb', color: '#ffffff', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 }