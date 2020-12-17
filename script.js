import http from 'k6/http';
import { sleep } from 'k6';

export default function () {
  http.get('http://localhost:5000/reviews?product_id=5');
  sleep(1);
}
