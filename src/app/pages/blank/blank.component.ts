import { Component } from '@angular/core';
import { TranslatePipe } from '../../theme/pipes/translate.pipe';

@Component({
    selector: 'app-blank',
    imports: [TranslatePipe],
    templateUrl: './blank.component.html',
    styleUrl: './blank.component.scss'
})
export class BlankComponent {

}
