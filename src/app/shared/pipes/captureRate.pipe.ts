import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "captureRate",
})
export class CaptureRatePipe implements PipeTransform {
  transform(rate: number): string {
    const percentage = (rate / 255) * 100;
    return `${percentage.toFixed(2)}%`;
  }
}
