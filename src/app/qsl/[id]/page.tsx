import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { QSLCardTemplate } from "@/components/qsl/QSLCardTemplate";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { qslCards, getTemplateById } from "@/lib/mock-data";
import { Check, X, Send, Share2, BookOpen } from "lucide-react";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function QSLDetailPage({ params }: Props) {
  const { id } = await params;
  const card = qslCards.find((c) => c.id === id);
  if (!card) notFound();

  const template = getTemplateById(card.templateId);
  if (!template) notFound();

  const isIncoming = card.toCallsign === "K2ABC" && card.status === "pending";

  return (
    <AppShell>
      <PageHeader
        title="QSL Card"
        backHref="/qsl"
        action={
          <Badge variant={card.status === "accepted" ? "success" : "warning"}>
            {card.status}
          </Badge>
        }
      />

      <QSLCardTemplate card={card} template={template} className="mb-6" />

      <Card className="mb-4">
        <h3 className="font-semibold text-ham-purple mb-2">QSO Details</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-gray-500">Date:</span> {card.date}</div>
          <div><span className="text-gray-500">UTC:</span> {card.utc}</div>
          <div><span className="text-gray-500">Frequency:</span> {card.mhz} MHz</div>
          <div><span className="text-gray-500">Mode:</span> {card.mode}</div>
          <div><span className="text-gray-500">RST:</span> {card.rst}</div>
          <div><span className="text-gray-500">QSL Via:</span> {card.qslVia}</div>
        </div>
      </Card>

      {isIncoming && (
        <div className="flex gap-3 mb-4">
          <Button className="flex-1 flex items-center justify-center gap-2">
            <Check className="w-4 h-4" />
            Accept
          </Button>
          <Button variant="danger" className="flex-1 flex items-center justify-center gap-2">
            <X className="w-4 h-4" />
            Reject
          </Button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="outline" className="flex items-center justify-center gap-2">
          <BookOpen className="w-4 h-4" />
          Add to Library
        </Button>
        <Button variant="outline" className="flex items-center justify-center gap-2">
          <Share2 className="w-4 h-4" />
          Share Card
        </Button>
        <Button className="flex items-center justify-center gap-2">
          <Send className="w-4 h-4" />
          Send Back QSL
        </Button>
      </div>
    </AppShell>
  );
}
