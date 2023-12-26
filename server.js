//아래 두 줄은 이제부터 express 라이브러리 사용하겠다는 뜻. 그냥 써두면 됨
const express = require('express')
const app = express() 

//아래 3줄 쓰면 서버 생성 끝. 내 컴퓨터 포트를 오픈하는 명령
app.listen(8080, () => {
    console.log('http://localhost:8080 에서 서버 실행중')
})

//누가 메인페이지 접속시
app.get('/', (요청, 응답)=> {
    응답.send('반갑다') //이거 보내주셈
})