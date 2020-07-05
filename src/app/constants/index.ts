import { environment } from '../../environments/environment';

export const BACKEND_ADDRESS = `${environment.BACKEND_BASE}${environment.BACKEND_PARAMS}`;

export enum GameState {
  StartsIn = 1,
  Game,
  Result,
  Loading
}

export class ApiResponse {
  data: any;
  success: boolean;
  errors: string;
}
