import { Form } from 'antd';
import { withRouter } from "react-router";

import EditPage from "../../lib/EditPage"
import App from "../../App";
import TestRequestForm from "./TestRequestForm";
import { CONTOUR_DOCUMENTS, MODULE_REQUEST } from "../../lib/ModuleConst"
import { buildURL} from "../../lib/Utils";

const CONTOUR = CONTOUR_DOCUMENTS;
const MODULE = MODULE_REQUEST;

const MNU_SUBSYSTEM = CONTOUR.name;
const HREF_SUBSYSTEM = "/" + CONTOUR.name;
const NAME_SUBSYSTEM = CONTOUR.title;
// в menu - key бокового главного
const MNU_MENU = MODULE.name;
const NAME_MENU = MODULE.title;
const MNU_SUMMENU = MODULE.name + ".sm1";

const URI_FOR_GET_ONE = buildURL(CONTOUR, MODULE, "testrequest") + "/get";
const URI_FOR_SAVE = buildURL(CONTOUR, MODULE, "testrequest") + "/save";

// Конвертация значений, приходящих и уходящих через API
const CONVERTORS = {
    date: ["documentRealDate"]
}

const TestRequestPage=(props)=>{
    const [form] = Form.useForm();
    const idValue = props.match.params.id;
    const editorContext = {
        id:idValue,
        uriForGetOne:URI_FOR_GET_ONE,
        uriForSave:URI_FOR_SAVE
    }
    

    return <App subsystem={MNU_SUBSYSTEM} menu={MNU_MENU} submenu={MNU_SUMMENU}
                breadcrumb={[{ label: NAME_SUBSYSTEM, href: HREF_SUBSYSTEM }, { label: NAME_MENU }]}>

            <EditPage idName="testRequestId" editorContext={editorContext} form={form} convertors={CONVERTORS}>
                  <TestRequestForm initialValues={{}} />
            </EditPage>
    </App>        
    
    
}

export default withRouter(TestRequestPage);