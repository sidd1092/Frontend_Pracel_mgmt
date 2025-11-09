import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
type DeliveryType = 'Standard' | 'Express' | 'SameDay';
type PackingPreference = 'Basic' | 'Premium';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule],
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.css']
})

export class BookingComponent implements OnInit {
  currentUser = { name: '', address: '', contact: '' };

  booking = {
    receiverName: '',
    receiverAddress: '',
    receiverPin: '',
    receiverMobile: '',
    parcelWeight: 0,
    parcelContentsDescription: '',
    parcelDeliveryType: '' as DeliveryType | '',
    parcelPackingPreference: '' as PackingPreference | '',
    parcelPickupTime: '',
    parcelDropoffTime: ''
  };

  parcelServiceCost = 0;
  bookingId = '';
  error = '';
  success = '';

  readonly baseRate = 50;
  readonly weightChargePerGram = 0.02;
  readonly deliveryCharges: Record<DeliveryType, number> = {
    Standard: 30,
    Express: 80,
    SameDay: 150
  };
  readonly packingCharges: Record<PackingPreference, number> = {
    Basic: 10,
    Premium: 30
  };
  readonly taxRate = 0.05;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    const name = localStorage.getItem('customerName') || '';
    const address = localStorage.getItem('customerAddress') || 'Default address';
    const contact = localStorage.getItem('customerContact') || 'Unknown';
    this.currentUser = { name, address, contact };
  }

  calculateParcelServiceCost() {
    if (!this.booking.parcelDeliveryType || !this.booking.parcelPackingPreference) {
      return 0;
    }
    const weightCharge = this.booking.parcelWeight * this.weightChargePerGram;
    const deliveryCharge = this.deliveryCharges[this.booking.parcelDeliveryType];
    const packingCharge = this.packingCharges[this.booking.parcelPackingPreference];
    const subtotal = this.baseRate + weightCharge + deliveryCharge + packingCharge;
    return +(subtotal * (1 + this.taxRate)).toFixed(2);
  }

  onSubmit() {
    if (
      !this.booking.receiverName || !this.booking.receiverAddress || !this.booking.receiverPin ||
      !this.booking.receiverMobile || this.booking.parcelWeight <= 0 ||
      !this.booking.parcelContentsDescription || !this.booking.parcelDeliveryType ||
      !this.booking.parcelPackingPreference || !this.booking.parcelPickupTime || !this.booking.parcelDropoffTime
    ) {
      this.error = 'Please fill in all required fields.';
      this.success = '';
      return;
    }
    this.error = '';
    this.parcelServiceCost = this.calculateParcelServiceCost();

    const parcelPaymentTime = new Date().toISOString();

    const payload = {
      ...this.booking,
      parcelServiceCost: this.parcelServiceCost,
      parcelPaymentTime,
      userName: this.currentUser.name,
      userAddress: this.currentUser.address,
      userContact: this.currentUser.contact
    };

    this.http.post<any>('http://localhost:8080/api/book', payload).subscribe(
      res => {
        if (res.bookingId) {
          this.bookingId = res.bookingId;
          this.success = 'Booking successful! Redirecting to payment.';
          setTimeout(() => this.router.navigate(['/payment'], { queryParams: { bookingId: this.bookingId } }), 3000);
        } else {
          this.error = 'Booking failed, try again later.';
          this.success = '';
        }
      },
      err => {
        this.error = 'Booking failed. Please try again.';
        this.success = '';
      }
    );
  }

  onReset() {
    this.booking = {
      receiverName: '',
      receiverAddress: '',
      receiverPin: '',
      receiverMobile: '',
      parcelWeight: 0,
      parcelContentsDescription: '',
      parcelDeliveryType: '',
      parcelPackingPreference: '',
      parcelPickupTime: '',
      parcelDropoffTime: ''
    };
    this.error = '';
    this.success = '';
    this.bookingId = '';
    this.parcelServiceCost = 0;
  }
}
