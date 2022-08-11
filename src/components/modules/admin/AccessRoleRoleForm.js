import React from 'react';
import { Form, Input } from 'antd';
import { FORM_ITEMS_LAYOUT } from "../../lib/Const";
import DataSelect from "../../lib/DataSelect"


const AccessRoleRoleForm = (props) => {
    const firstInputRef = React.useRef(null);
    const [accessRoleInterface] = React.useState({});

    React.useEffect(() => {
        setTimeout(() => {
            if (firstInputRef.current) {
                firstInputRef.current.focus({
                    cursor: 'end',
                })
            }
        }, 100);
    });

    return <Form
        {...FORM_ITEMS_LAYOUT}
        form={props.form}
        layout="horizontal"
        name="formAccessRoleRole"
        onFieldsChange={(changedFields,allFields)=>{
            /*
            changedFields.forEach(f=>{
                console.log("f.name[0]" + f.name[0]);
                if(f.name[0]=="accessRoleParentId") {
                    const val = accessRoleInterface.getDisplayValue(f.value);
                    props.form.setFieldsValue({"accessRoleNameParent":val});
                }
            });
            */
            props.onFieldsChange();
        }}
        initialValues={props.initialValues}>
        <Form.Item
            name='accessRoleIdParent'
            label='Роль'
            rules={[
                { required: true }
            ]}>
            <DataSelect 
                    uri={"admin/credential/accessrole/getlist"} 
                    params={{
                        "pagination": {
                            "current": 1,
                            "pageSize": -1
                        },
                        "sort": [
                            {
                                "field": "accessRoleName",
                                "order": "ascend"
                            }
                        ]
                    }}
                    valueName="accessRoleId"
                    displayValueName="accessRoleName" // Это поле которое выпадает в список
                    // Значение берется из вызывающей формы из этого поля
                    displayValue={props.initialValues["accessRoleNameParent"]} interface={accessRoleInterface}/>
        </Form.Item>
        <Form.Item
            name='accessRoleIdChild'
            label='Содержит'
            rules={[
                { required: true }
            ]}>
            <DataSelect 
                    uri={"admin/credential/accessrole/getlist"} 
                    params={{
                        "pagination": {
                            "current": 1,
                            "pageSize": -1
                        },
                        "sort": [
                            {
                                "field": "accessRoleName",
                                "order": "ascend"
                            }
                        ]
                    }}
                    valueName="accessRoleId"
                    displayValueName="accessRoleName" // Это поле которое выпадает в список
                    displayValue={props.initialValues["accessRoleNameChild"]} interface={accessRoleInterface}/>
        </Form.Item>
    </Form>
}

export default AccessRoleRoleForm;
