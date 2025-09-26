import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe]
})
export class SearchBarComponent implements OnInit {
  @Input() loading = false;
  @Output() search = new EventEmitter<string>();
  @Output() filterChange = new EventEmitter<any>();

  searchForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.searchForm = this.fb.group({
      query: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  ngOnInit(): void {}

  onSearch(): void {
    if (this.searchForm.valid) {
      const query = this.searchForm.get('query')?.value?.trim();
      if (query && query.length >= 2) {
        this.loading = true;
        this.search.emit(query);
      }
    }
  }

  onInputChange(): void {
    const query = this.searchForm.get('query')?.value?.trim();
    if (query && query.length >= 2) {
      this.search.emit(query);
    }
  }

  setLoading(loading: boolean): void {
    this.loading = loading;
    if (loading) {
      this.searchForm.get('query')?.disable();
    } else {
      this.searchForm.get('query')?.enable();
    }
  }

  clearSearch(): void {
    this.searchForm.patchValue({ query: '' });
  }
}
