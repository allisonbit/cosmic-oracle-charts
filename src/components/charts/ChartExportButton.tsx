import { useState, type RefObject } from "react";
import { Download, FileImage, FileCode, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportChartPNG, exportChartSVG } from "@/lib/chartExport";
import { toast } from "sonner";

interface Props {
  targetRef: RefObject<HTMLElement>;
  filename: string;
  className?: string;
  size?: "sm" | "default";
}

export function ChartExportButton({ targetRef, filename, className, size = "sm" }: Props) {
  const [busy, setBusy] = useState(false);

  const doExport = async (fmt: "png" | "svg") => {
    if (!targetRef.current) {
      toast.error("Chart not ready");
      return;
    }
    setBusy(true);
    try {
      if (fmt === "png") await exportChartPNG(targetRef.current, filename);
      else await exportChartSVG(targetRef.current, filename);
      toast.success(`Exported as ${fmt.toUpperCase()}`);
    } catch (e) {
      console.error("Chart export failed", e);
      toast.error("Export failed — try again");
    } finally {
      setBusy(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size={size} className={className} disabled={busy} aria-label="Export chart">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          <span className="ml-2 hidden sm:inline">Export</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => doExport("png")}>
          <FileImage className="w-4 h-4 mr-2" /> Download PNG
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => doExport("svg")}>
          <FileCode className="w-4 h-4 mr-2" /> Download SVG
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}