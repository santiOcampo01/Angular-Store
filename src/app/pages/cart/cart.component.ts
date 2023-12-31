import { Component, OnInit , ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/enviroment/enviroment';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  loading: boolean = true;
  disabled: boolean = true;
  user: any;
  message: string = '';
  cartItems: any[] = [];
  quantityCart: number = 0;
  paymentLink: string = '';

  constructor(private http: HttpClient,
    private router: Router,
     private cdr: ChangeDetectorRef,
     private _snackBar: MatSnackBar ) {}

  ngOnInit() {
    const userJson: string = localStorage.getItem('user')!;
    const user = JSON.parse(userJson);
    const userID = user.userID;
    const url: string = environment.api;
    console.log(userID);

    // Obtener usuario desde la API
    this.http.get(`${url}/api/cart/user/${userID}/active`).subscribe(
      (response: any) => {
        this.cartItems = response;
        this.quantityCart = response.quantity;
        console.log('Carrito de compras:', response);
        this.loading = false;
      },
      (error: any) => {
        console.error(error);

        this.loading = false;
      }
    );
  }
  calculateTotal(): number {
    let total = 0;
    this.cartItems.forEach(item => {
      const price = Number(item.product.price);
      const quantity = Number(item.quantity);
      if (!isNaN(price) && !isNaN(quantity)) {
        total += price * quantity;
      }
    });
    return total;
  }


  substractProduct(product: any) {
    const url: string = environment.api;
    const userJson: string = localStorage.getItem('user')!;
    const user = JSON.parse(userJson);
    const userID = user.userID;
    const data = {
      userID: userID,
      productID: product.productID,
      quantity: -1
    };

    this.http.post(`${url}/api/cart`, data).subscribe(
      (response: any) => {
        console.log(response);
        this.cdr.detectChanges();
        product.quantity--;
      },
      (error: any) => {
        console.error(error);
        this.error();
        // this.message = error.error.message;
        this.loading = false;
      }
    );
  }



  error() {
    this._snackBar.open('Debes almacenar al menos un item', '', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    })
  }


  removeProduct(cartID: any) {
    const url: string = environment.api;

    this.http.delete(`${url}/api/cart/${cartID}`).subscribe(
      (response: any) => {
        this.cdr.detectChanges();
        this.cartItems = this.cartItems.filter((item) => item.cartID !== cartID);
        console.log('Eliminado con éxito', response);
        //renderi


      },
      (error: any) => {
        console.error(error);
        this.message = error.error.message;
      }
    );
  }

  addProduct(product: any) {
    const url: string = environment.api;
    const userJson: string = localStorage.getItem('user')!;
    const user = JSON.parse(userJson);
    const userID = user.userID;
    console.log(userID);

    const data = {
      userID: userID,
      productID: product.productID,
      quantity: 1
    };
    
    this.http.post(`${url}/api/cart`, data).subscribe(
      (response: any) => {
        // Lógica adicional después de agregar un producto al carrito
        console.log(response);
        //renderizar

        this.cdr.detectChanges();
        product.quantity++;

      },
      (error: any) => {
        console.error(error);
        this.errorAdding();
        // this.message = error.error.message;
        this.loading = false;
      }
    );
  }

  errorAdding() {
    this._snackBar.open('Debes almacenar al menos un item', '', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    })
  }

  payment() {
    const url: string = environment.api;
    const userJson: string = localStorage.getItem('user')!;
    const user = JSON.parse(userJson);
    const userID = user.userID;
    const shippingAddress = user.address;
    const data = {
      userID: userID,
      shippingAddress: shippingAddress
    };

    if (this.cartItems.length === 0) {
      this.message = 'No hay productos en el carrito';
      return;
    }
    this.http.post(`${url}/api/orders`, data).subscribe(
      (response: any) => {
        console.log(response);
        this.paymentLink = response.url;
        // cambiar la url de la misma ventana
        window.open(this.paymentLink, '_self');
      },
      (error: any) => {
        console.error(error);
        this.message = error.error.message;
        this.loading = false;
      }
    );
  }
}
