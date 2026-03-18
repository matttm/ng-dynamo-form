import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly formOptions = [
    {
      label: 'Generic configurable form',
      value: 'generic-configurable-form',
    },
  ];

  readonly yearOptions = [2025, 2026];
  selectedFormId = 'generic-configurable-form';
  selectedYear = 2026;

  constructor() {
    this.syncSelectionFromRoute();

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.syncSelectionFromRoute();
      });
  }

  navigateToSelection(): void {
    void this.router.navigate(['/forms', this.selectedFormId, 'years', this.selectedYear]);
  }

  private syncSelectionFromRoute(): void {
    let currentRoute = this.activatedRoute;

    while (currentRoute.firstChild) {
      currentRoute = currentRoute.firstChild;
    }

    const formId = currentRoute.snapshot.paramMap.get('formId');
    const year = Number(currentRoute.snapshot.paramMap.get('year'));

    if (formId) {
      this.selectedFormId = formId;
    }

    if (Number.isInteger(year) && this.yearOptions.includes(year)) {
      this.selectedYear = year;
    }
  }
}
