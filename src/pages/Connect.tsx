import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Copy, Bot, Sparkles } from "lucide-react";

const PROJECT_REF =
  (import.meta.env.VITE_SUPABASE_PROJECT_ID as string) || "qynszkirmcrldqmiplwh";
const MCP_URL = `https://${PROJECT_REF}.supabase.co/functions/v1/mcp`;

export default function Connect() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(MCP_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* noop */
    }
  };

  return (
    <Layout>
      <div className="container mx-auto max-w-3xl px-4 py-10 space-y-8">
        <header className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Connect Oracle Bull to your AI assistant
          </h1>
          <p className="text-muted-foreground">
            Give ChatGPT or Claude access to Oracle Bull's live crypto market
            tools. Copy the server URL below, then follow the steps for your
            assistant.
          </p>
        </header>

        <Card className="p-5 space-y-3">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            MCP Server URL
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <code className="flex-1 px-3 py-2 rounded-md bg-muted text-foreground text-sm break-all font-mono">
              {MCP_URL}
            </code>
            <Button onClick={copy} variant="default" className="shrink-0">
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" /> Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" /> Copy URL
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Once connected, your assistant can search tokens, fetch live prices
            and market data, and pull trending coins from Oracle Bull.
          </p>
        </Card>

        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">
              Connect from ChatGPT
            </h2>
          </div>
          <ol className="list-decimal list-inside space-y-2 text-sm text-foreground/90 marker:text-primary marker:font-semibold">
            <li>
              Open{" "}
              <a
                href="https://chatgpt.com/#settings/Connectors/Advanced"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2"
              >
                ChatGPT → Settings → Connectors → Advanced
              </a>{" "}
              and enable <strong>Developer mode</strong> (read the risk notice
              shown there).
            </li>
            <li>
              In the chat composer, open the <strong>"+"</strong> menu and turn
              on <strong>Developer mode</strong>.
            </li>
            <li>
              Click <strong>Add sources</strong>, then <strong>Connect more</strong>.
            </li>
            <li>
              Name the connector <em>Oracle Bull</em> and paste the MCP URL
              above.
            </li>
            <li>
              Ask ChatGPT to use Oracle Bull — e.g. "Use Oracle Bull to get the
              current price of Ethena."
            </li>
          </ol>
        </Card>

        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">
              Connect from Claude
            </h2>
          </div>
          <ol className="list-decimal list-inside space-y-2 text-sm text-foreground/90 marker:text-primary marker:font-semibold">
            <li>
              Open{" "}
              <a
                href="https://claude.ai/customize/connectors?modal=add-custom-connector"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2"
              >
                Claude → Connectors → Add custom connector
              </a>
              .
            </li>
            <li>
              Name the connector <em>Oracle Bull</em> and paste the MCP URL
              above.
            </li>
            <li>
              Enable the connector from the chat composer, then ask Claude to
              use Oracle Bull — e.g. "What's trending on Oracle Bull right
              now?"
            </li>
          </ol>
        </Card>
      </div>
    </Layout>
  );
}