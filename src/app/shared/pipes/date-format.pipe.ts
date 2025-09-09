import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateFormat',
  standalone: true
})
export class DateFormatPipe implements PipeTransform {

  transform(value: string | Date | null | undefined, format: string = 'short'): string {
    if (!value) {
      return '-';
    }

    let date: Date;
    
    // Handle different input types
    if (typeof value === 'string') {
      // Check if it's in dd/mm/yyyy format
      if (this.isDDMMYYYYFormat(value)) {
        date = this.parseDDMMYYYY(value);
      } else {
        date = new Date(value);
      }
    } else if (value instanceof Date) {
      date = value;
    } else {
      return '-';
    }

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return '-';
    }

    // Format based on the requested format
    switch (format) {
      case 'short':
        return date.toLocaleDateString('es-CL', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
      case 'medium':
        return date.toLocaleDateString('es-CL', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      case 'long':
        return date.toLocaleDateString('es-CL', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      case 'time':
        return date.toLocaleTimeString('es-CL', {
          hour: '2-digit',
          minute: '2-digit'
        });
      default:
        return date.toLocaleDateString('es-CL');
    }
  }

  private isDDMMYYYYFormat(dateString: string): boolean {
    // Check if string matches dd/mm/yyyy or dd/mm/yyyy hh:mm:ss pattern
    const ddmmyyyyPattern = /^(\d{1,2})\/(\d{1,2})\/(\d{4})(\s+\d{1,2}:\d{2}(:\d{2})?)?$/;
    return ddmmyyyyPattern.test(dateString);
  }

  private parseDDMMYYYY(dateString: string): Date {
    // Extract date parts from dd/mm/yyyy format
    const parts = dateString.split(' ')[0].split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // JavaScript months are 0-based
      const year = parseInt(parts[2], 10);
      
      // Create date with correct day/month order
      return new Date(year, month, day);
    }
    
    // Fallback to standard parsing
    return new Date(dateString);
  }
}

