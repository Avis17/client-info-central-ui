import { Component, Injectable, Input, Output, EventEmitter, TemplateRef, ViewChild } from '@angular/core'
import { ModalConfig } from '../../../utils/modal.config'
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap'

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent {
  @ViewChild('modal') private modalContent: TemplateRef<ModalComponent>
  private modalRef: NgbModalRef
  @Input() modalConfig: ModalConfig;
  @Output() outputSaved: EventEmitter<any> = new EventEmitter();

  constructor(private modalService: NgbModal) { }

  ngAfterViewInit() {
    console.log('Values on ngAfterViewInit():');
  }

  ngOnInit(): void {
    console.log(this.modalConfig)
   }

  open(): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      this.modalRef = this.modalService.open(this.modalContent,  { size: 'lg', scrollable: true, backdrop: 'static', keyboard: false, })
      this.modalRef.result.then(resolve, resolve)
    })
  }

  async close(): Promise<void> {
    if (this.modalConfig.shouldClose === undefined || (await this.modalConfig.shouldClose())) {
      const result = this.modalConfig.onClose === undefined || (await this.modalConfig.onClose())
      this.modalRef.close(result)
    }
  }

  async save(): Promise<void> {
    if (this.modalConfig.shouldDismiss === undefined || (await this.modalConfig.shouldDismiss())) {
      const result = this.modalConfig.onDismiss === undefined || (await this.modalConfig.onDismiss())
      this.modalRef.dismiss(result)
    }
  }
}
