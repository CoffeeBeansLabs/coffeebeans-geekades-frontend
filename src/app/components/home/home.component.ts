import { Component, OnInit, HostListener } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { UserService } from 'src/app/service/user.service';
import { GameState } from 'src/app/constants';
import { ApiService } from 'src/app/service/api.service';
import { ApiResponse } from 'src/app/constants';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.less']
})
export class HomeComponent implements OnInit {

  private token: string = null;
  private timer;
  private isForceClosed = false;

  isSubmitting = false;
  seconds = 0;
  minutes = 0;
  resultEvent = null;
  roundEvent = null;
  chancesUsed = 0;
  roundOrGame = 'GAME';

  GameState = GameState;
  gameState = GameState.Loading;

  @HostListener('window:beforeunload', ['$event'])
  onWindowScroll() {
    if (this.token != null) {
      this.socket.emit('unregister', {
        token: this.token
      });
    }
  }
  constructor(
    private userService: UserService,
    private socket: Socket,
    private apiService: ApiService,
    private router: Router,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit() {
    this.attachSocket();
    this.spinner.show();

    this.userService.getToken().subscribe((idToken: string) => {
      this.token = idToken;
      if (idToken != null) {
        this.socket.emit('register', {
          token: idToken
        });
      }
    });
  }

  onLogoutClick() {
    if (this.token != null) {
      this.socket.emit('unregister', {
        token: this.token
      });
    }

    this.apiService.logout().subscribe((apiResponse: ApiResponse) => {
      this.userService.logout();
      this.router.navigate(['/']);
    }, (error) => {
      throwError(error);
      this.userService.logout();
      this.router.navigate(['/']);
    });
  }

  onSubmitClick(answerTxt: any) {
    if (answerTxt.value.length > 0 && !this.isSubmitting) {
      this.isSubmitting = true;
      this.apiService.submit(answerTxt.value).subscribe((apiResponse: ApiResponse) => {
        answerTxt.value = '';

        if (apiResponse.success) {
          this.chancesUsed = apiResponse.data.count;
        } else {
          this.chancesUsed = apiResponse.data.count;
        }

        this.isSubmitting = false;
      }, (error) => {
        this.isSubmitting = false;
        throwError(error);
      });
    }
  }

  attachSocket() {
    this.socket.on('starts_in', (event) => {
      this.gameState = GameState.StartsIn;
      this.chancesUsed = 0;
      this.roundOrGame = event.type;
      this.setTimer(event.time - 2);
    });

    this.socket.on('next_hint', (event) => {
      if (this.gameState === GameState.StartsIn) {
        this.gameState = GameState.Loading;
      }
      const img = new Image();
      img.src = event.img;
      img.onload = () => {
        this.gameState = GameState.Game;
        this.roundEvent = event;
      };
      this.setTimer(event.hint_time - 1);

      if (event.count !== undefined) {
        this.chancesUsed = event.count;
      }
    });

    this.socket.on('result', (event) => {
      this.gameState = GameState.Result;
      this.resultEvent = event;
    });

    this.socket.on('closing', () => {
      this.isForceClosed = true;
      this.gameState = GameState.Loading;
      this.socket.disconnect();
    });

    this.socket.on('disconnect', (data) => {
      if (!this.isForceClosed) {
        this.socket.emit('register', {
          token: this.token
        });
      }
    });
  }

  startTimer() {
    this.timer = setInterval(() => {
      if (this.seconds > 0) {
        this.seconds--;
      } else {
        if (this.minutes > 0) {
          this.seconds = 59;
          this.minutes--;
        } else if (this.seconds === 1) {
          clearInterval(this.timer);
        }
      }
    }, 1000);
  }

  setTimer(seconds: number) {
    clearInterval(this.timer);
    this.seconds = Math.floor(seconds % 60);
    this.seconds = (this.seconds < 0) ? 0 : this.seconds;
    this.minutes = Math.floor(seconds / 60);
    this.minutes = (this.minutes < 0) ? 0 : this.minutes;

    this.startTimer();
  }
}
