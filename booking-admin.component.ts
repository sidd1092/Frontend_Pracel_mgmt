import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

type DeliveryType = 'Standard' | 'Express' | 'SameDay';
type PackingPreference = 'Basic' | 'Premium';

@Component({
  selector: 'app-booking-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule],
  templateUrl: './booking-admin.component.html',
  styleUrls: ['./booking-admin.component.css']
})
export class BookingAdminComponent implements OnInit {
  selectedUser = { name: '', address: '', contact: '' };

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
  readonly adminFee = 50;
  readonly taxRate = 0.05;

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    // Demo: populate user from route or hardcoded for now
    this.selectedUser = {
      name: this.route.snapshot.queryParamMap.get('name') || 'Default Customer',
      address: this.route.snapshot.queryParamMap.get('address') || 'Unknown Address',
      contact: this.route.snapshot.queryParamMap.get('contact') || 'Unknown Contact'
    };
  }

  calculateAdminServiceCost() {
    if (!this.booking.parcelDeliveryType || !this.booking.parcelPackingPreference) {
      return 0;
    }
    const weightCharge = this.booking.parcelWeight * this.weightChargePerGram;
    const deliveryCharge = this.deliveryCharges[this.booking.parcelDeliveryType as DeliveryType];
    const packingCharge = this.packingCharges[this.booking.parcelPackingPreference as PackingPreference];
    const subtotal = this.baseRate + weightCharge + deliveryCharge + packingCharge + this.adminFee;
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
    this.parcelServiceCost = this.calculateAdminServiceCost();

    const parcelPaymentTime = new Date().toISOString();

    const payload = {
      ...this.booking,
      parcelServiceCost: this.parcelServiceCost,
      parcelPaymentTime,
      userName: this.selectedUser.name,
      userAddress: this.selectedUser.address,
      userContact: this.selectedUser.contact,
      adminBooking: true
    };

    this.http.post<any>('http://localhost:8080/api/admin-book', payload).subscribe(
      res => {
        if (res.bookingId) {
          this.bookingId = res.bookingId;
          this.success = 'Booking confirmed! Inform customer to present this ID for offline payment and status update.';
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
