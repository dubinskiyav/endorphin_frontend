//=======================================================================
//==================================== сервис остатков Тенториум, 
//==================================== при внедрении складов будет убран
//=======================================================================
import { userProps } from '../../lib/LoginForm';

export const NAME_TENTORIUM_TOKEN = "tentorium-token";


const TENTORIUM_SERV_BASE_URL_TEST="https://cons24.tentorium.ru/TradeDeveloper/hs";
const TENTORIUM_SERV_BASE_URL_PROD="https://cons24.tentorium.ru/TradeDeveloper/hs";  //TODO определить

const BASE_URL = process.env.NODE_ENV == "production" ? TENTORIUM_SERV_BASE_URL_PROD :
TENTORIUM_SERV_BASE_URL_TEST;


/**
 * Методы API должны возвращать http статус UNAUTHORIZED, если токен устарел или неверен
 */
export const HTTP_STATUS_UNAUTHORIZED = 401;
 
export const requestLeftover = (scCode)=> {
    let token;
    console.log("userProps",userProps);

    const query = {
        command:"Gelikon",
        arguments:{
        TypeRequest:"Leftover",
            SC:scCode
        }
    }
    return new Promise((resolve, reject) => {

        if(!userProps.externalServiceTokens) {
            reject({ message: "Требутся повторный вход в систему"});
            return;
        }

        token = userProps
            .externalServiceTokens["Tentorium-LeftoverToken-"+(process.env.NODE_ENV == "production"?"Prod":"Test")];

        const options = {
            method: 'post',
            mode: 'cors',
            body: JSON.stringify(query),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + token
            },
            credentials: "omit"
        };
        fetch(BASE_URL + "/src/src" , options)
            .then(response => {
                if (!response.ok) {
                    let status = response.status,
                        statusText = response.statusText;
                    
                    if (status == HTTP_STATUS_UNAUTHORIZED) {
                        statusText = "Нет доступа к сервису получения остатков";
                    }

                    const err = new Error(statusText)
                    err.status = status;

                    throw err;
                };
                return response.json()
            })
            .then(json => {
                console.log(json);
                if (json && json.result && json.result.error) {
                    console.error(json.result);
                    reject({ message: json.result.text });
                } else {
                    resolve(json.data);
                }
            })
            .catch((error) => {
                console.error(error);
                if (error.status) {
                    reject(error);
                } else {
                    reject({ message: "Cервис получения остатков недоступен" });
                }
            })


    });    
}