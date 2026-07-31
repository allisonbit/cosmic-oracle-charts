import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Preview, Text, Button, Section, Row, Column } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Mover { symbol: string; change: number }
interface Props {
  weekOf?: string
  btcChange?: number
  ethChange?: number
  topMovers?: Mover[]
  summary?: string
}

const pct = (n?: number) => (typeof n === 'number' ? `${n >= 0 ? '+' : ''}${n.toFixed(2)}%` : '—')

const Email = ({ weekOf, btcChange, ethChange, topMovers = [], summary }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your Oracle Bull weekly market recap</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Weekly Market Report{weekOf ? ` · ${weekOf}` : ''}</Heading>
        {summary ? <Text style={text}>{summary}</Text> : null}
        <Section style={grid}>
          <Row>
            <Column style={cell}><Text style={label}>BTC 7d</Text><Text style={value(btcChange)}>{pct(btcChange)}</Text></Column>
            <Column style={cell}><Text style={label}>ETH 7d</Text><Text style={value(ethChange)}>{pct(ethChange)}</Text></Column>
          </Row>
        </Section>
        {topMovers.length > 0 && (
          <Section style={{ marginTop: '20px' }}>
            <Heading as="h2" style={h2}>Top movers</Heading>
            {topMovers.slice(0, 8).map((m) => (
              <Row key={m.symbol}>
                <Column style={mvSym}>{m.symbol}</Column>
                <Column style={mvVal(m.change)}>{pct(m.change)}</Column>
              </Row>
            ))}
          </Section>
        )}
        <Section style={{ textAlign: 'center', margin: '28px 0' }}>
          <Button href="https://oraclebull.com/dashboard" style={btn}>Open dashboard</Button>
        </Section>
        <Text style={muted}>Sent every Monday. Not financial advice.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (d: Props) => `Oracle Bull Weekly · ${d?.weekOf ?? 'Market Recap'}`,
  displayName: 'Weekly Report',
  previewData: {
    weekOf: '2026-07-14',
    btcChange: 3.2,
    ethChange: -1.4,
    summary: 'BTC held its range while ETH cooled after last week\'s pump.',
    topMovers: [
      { symbol: 'SOL', change: 12.4 },
      { symbol: 'DOGE', change: -8.1 },
    ],
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container = { padding: '32px 24px', maxWidth: '600px', margin: '0 auto' }
const h1 = { color: '#0f172a', fontSize: '22px', fontWeight: 700, margin: '0 0 12px' }
const h2 = { color: '#0f172a', fontSize: '16px', fontWeight: 700, margin: '16px 0 8px' }
const text = { color: '#334155', fontSize: '15px', lineHeight: '24px' }
const grid = { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', margin: '16px 0' }
const cell = { padding: '8px 12px' }
const label = { color: '#64748b', fontSize: '12px', textTransform: 'uppercase' as const, margin: 0 }
const value = (n?: number) => ({ color: (n ?? 0) >= 0 ? '#059669' : '#dc2626', fontSize: '20px', fontWeight: 700, margin: '4px 0 0' })
const mvSym = { padding: '6px 8px', color: '#0f172a', fontWeight: 600, fontSize: '14px' }
const mvVal = (n: number) => ({ padding: '6px 8px', textAlign: 'right' as const, color: n >= 0 ? '#059669' : '#dc2626', fontWeight: 600, fontSize: '14px' })
const muted = { color: '#64748b', fontSize: '13px', marginTop: '24px', textAlign: 'center' as const }
const btn = { backgroundColor: '#2563eb', color: '#ffffff', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 }