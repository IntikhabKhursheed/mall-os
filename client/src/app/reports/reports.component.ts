import { CommonModule, NgFor } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { PageHeaderComponent } from "../shared/page-header/page-header.component";
import { MallDataService, ReportCard } from "../core/services/mall-data.service";

type ReportTab = "overview" | "sales" | "inventory" | "staff";

@Component({
  selector: "app-reports",
  standalone: true,
  imports: [CommonModule, FormsModule, NgFor, PageHeaderComponent],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss'
})
export class ReportsComponent implements OnInit {
  private readonly mallData = inject(MallDataService);

  activeTab: ReportTab = "overview";
  searchTerm = "";
  cards: ReportCard[] = [];
  filteredCards: ReportCard[] = [];
  summaryLines: Array<{ label: string; value: string }> = [];

  ngOnInit(): void {
    this.loadData();
  }

  setTab(tab: ReportTab): void {
    this.activeTab = tab;
    this.loadData();
  }

  loadData(): void {
    this.mallData.getReportCards(this.searchTerm).subscribe((cards) => {
      this.cards = cards;
      this.filteredCards = cards.filter((card) => {
        if (this.activeTab === "overview") {
          return true;
        }
        if (this.activeTab === "sales") {
          return card.title.toLowerCase().includes("revenue") || card.detail.toLowerCase().includes("sales");
        }
        if (this.activeTab === "inventory") {
          return card.title.toLowerCase().includes("inventory") || card.detail.toLowerCase().includes("stock");
        }
        return card.title.toLowerCase().includes("staff") || card.detail.toLowerCase().includes("shift");
      });
      this.summaryLines = [
        { label: "Visible cards", value: String(this.filteredCards.length) },
        { label: "Search term", value: this.searchTerm.trim() || "None" },
        { label: "Active tab", value: this.activeTab }
      ];
    });
  }
}
