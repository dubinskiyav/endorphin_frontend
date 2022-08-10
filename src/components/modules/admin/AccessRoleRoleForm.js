import React from 'react';
import { Form, Input, Checkbox } from 'antd';
import { FORM_ITEMS_LAYOUT } from "../../lib/Const";


const AccessRoleRoleForm = (props) => {
    const firstInputRef = React.useRef(null);

    React.useEffect(() => {
        setTimeout(() => {
            firstInputRef.current.focus({
                cursor: 'end',
            })
        }, 100);
    });

    return <Form
        {...FORM_ITEMS_LAYOUT}
        form={props.form}
        layout="horizontal"
        name="formAccessRoleRole"
        onFieldsChange={props.onFieldsChange}
        initialValues={props.initialValues}>
        <Form.Item
            name='accessRoleNameParent'
            label='Наименование родителя'
            rules={[
                { required: true },
                { max: 30 }
            ]}>
            <Input ref={firstInputRef} />
        </Form.Item>
        <Form.Item
            name='accessRoleNoteParent'
            label='Описание родителя'
            rules={[
                { max: 255 }
            ]}>
            <Input />
        </Form.Item>
        <Form.Item
            name='accessRoleVisibleParent'
            label='Видимость родителя'
            valuePropName="checked"
            getValueFromEvent={(event) => {
                return event.target.checked ? 1 : 0;
            }}
        >
            <Checkbox></Checkbox>
        </Form.Item>
        <Form.Item
            name='accessRoleNameChild'
            label='Наименование ребенка'
            rules={[
                { required: true },
                { max: 30 }
            ]}>
            <Input ref={firstInputRef} />
        </Form.Item>
        <Form.Item
            name='accessRoleNoteChild'
            label='Описание ребенка'
            rules={[
                { max: 255 }
            ]}>
            <Input />
        </Form.Item>
        <Form.Item
            name='accessRoleVisibleChild'
            label='Видимость ребенка'
            valuePropName="checked"
            getValueFromEvent={(event) => {
                return event.target.checked ? 1 : 0;
            }}
        >
            <Checkbox></Checkbox>
        </Form.Item>
    </Form>
}

export default AccessRoleRoleForm;
