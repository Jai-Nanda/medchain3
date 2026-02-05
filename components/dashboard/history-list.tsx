"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { downloadRecordFile } from "@/lib/ledger"
import type { RecordItem } from "@/lib/types"
import { ClientDate } from "./ClientDate"

export default function HistoryList({ items }: { items: RecordItem[] }) {
  if (!items?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="h-16 w-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-[#2596be]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-sm text-muted-foreground">No records yet. Upload your first medical report to get started.</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-[#2596be]/20 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gradient-to-r from-[#2596be]/5 to-[#2596be]/10 hover:bg-[#2596be]/10">
            <TableHead className="font-semibold text-[#2596be]">Type</TableHead>
            <TableHead className="font-semibold text-[#2596be]">Title</TableHead>
            <TableHead className="font-semibold text-[#2596be]">Author</TableHead>
            <TableHead className="font-semibold text-[#2596be]">Date</TableHead>
            <TableHead className="font-semibold text-[#2596be]">File</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((it) => (
            <TableRow key={it.id} className="hover:bg-blue-50/50 transition-colors">
              <TableCell>
                <Badge 
                  variant={it.type === "report" ? "default" : "secondary"}
                  className={it.type === "report" ? "bg-[#2596be] hover:bg-[#1a7a9e]" : ""}
                >
                  {it.type}
                </Badge>
              </TableCell>
            <TableCell className="max-w-[280px] truncate">
              {it.title || (it.type === "update" ? "Doctor update" : "Report")}
            </TableCell>
            <TableCell className="max-w-[200px] truncate">{it.authorName}</TableCell>
            <TableCell><ClientDate timestamp={it.createdAt} /></TableCell>
            <TableCell>
              {it.fileId ? (
                <Button variant="outline" size="sm" onClick={() => downloadRecordFile(it.id)}>
                  Download
                </Button>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
    </div>
  )
}
