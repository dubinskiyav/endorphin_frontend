import React from 'react';
import { Button, Modal, Space, notification, Input } from 'antd';
import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';
import DataTree from "../../lib/DataTree";
import DataTable from "../../lib/DataTable";
import { DEBOUNCE_TIMEOUT } from '../../lib/Const';
import { debounce, drawFloat, drawInt } from "../../lib/Utils";
import SplitterLayout from "react-splitter-layout";
import 'react-splitter-layout/lib/index.css';
import { confirm } from '../../lib/Dialogs';
import { format } from 'react-string-format';
import {requestLeftover} from '../external/Leftover';
import { userProps } from '../../lib/LoginForm';
import { serviceCenter } from '../../lib/tentoriumConst';

export const tableInterface = { isLoading: () => false, getSelectedRows: () => [] };


let historyJump = [];
let historyCurrent = 0;
const treeInterface = {};

//==================================== индекс для поиска остаков
//==================================== на основании сервиса Тенториум, при внедрении складов будет убран
const LeftoverGlobalMap = {};
let leftoverAccessFlag = false;
let checkLeftoverService = false;


const COLUMNS = [
    {
        title: 'Хар-ка',
        dataIndex: 'characterCode',
        width: "70px"
    },
    {
        title: 'Наименование',
        dataIndex: 'sgoodName',
        sorter: true,
        ellipsis: true,
        defaultSortOrder: 'ascend'
    },
    {
        title: 'Цена',
        dataIndex: 'sgoodPrice',
        align:"right",
        render: drawFloat,
        width: "90px"
    },
    {
        title: 'Баллы',
        dataIndex: 'points',
        align:"right",
        render: drawInt,
        width: "60px"
    },
    {
        title: 'Примечание',
        dataIndex: 'sgoodDescription',
        sorter: true,
        ellipsis: true,
    },
    {
        title: 'Остаток у нас',
        dataIndex: 'leftOver', 
        sorter: false,
        ellipsis: true,
        align:"right",
        width: "90px",
        render:(_,record)=>{
            let lo = LeftoverGlobalMap[record.characterCode];
            return lo?lo.Leftover:!leftoverAccessFlag?"нд":""
        }
    },
    {
        title: 'Расход за месяц',
        dataIndex: 'shipped', 
        sorter: false,
        ellipsis: true,
        align:"right",
        width: "90px",
        render:(_,record)=>{
            let lo = LeftoverGlobalMap[record.characterCode];
            return lo?lo.shipped:!leftoverAccessFlag?"нд":""
        }
    },
    {
        title: 'Кол-во',
        dataIndex: 'requestPosCount',
        render: (value, record) => value ? drawInt(value, record) : <span>&nbsp;</span>,
        editable: true,
        editComponentName: "InputNumber",
        autoCheckRecord: true,
        width: "106px",
    }
];


const getColumns = () => {
    // сервис Leftover рабортает только для Сервисных центров
    if (userProps && userProps.userKind !== serviceCenter) {
        return COLUMNS.filter(value => value.dataIndex !== "leftOver" && value.dataIndex !== "shipped");
    }
    return COLUMNS;
}

export const requestPosGroupForm = (params, finalyCB, allData) => {
    historyJump = [-1];
    historyCurrent = 0;

    // создание индекса остатков
    if(!checkLeftoverService) {
        checkLeftoverService = true;
        requestLeftover(userProps.subject.subjectCode)
        .then((data)=>{
            leftoverAccessFlag = true;
            data.forEach(d=>LeftoverGlobalMap[d["Характеристика"]]=d)
        })
        .catch(err=>{
            notification.error({ message: err.message });
        })
    }

    const handleSelect = (selectedKeys, obj, jumpFlag) => {
        if (!jumpFlag && tableInterface.getSelectedRecords().filter(value => value.requestPosCount !== undefined).length !== 0) {
            confirm("При изменении категории введенное количество будет сброшено. Продолжить?",
                () => {
                    if (!jumpFlag) {
                        putToHistory(selectedKeys[0]);
                    }
                    tableInterface.requestParams.filters["parentId"] = selectedKeys[0];
                    tableInterface.refreshData();
                },
                () => {
                    treeInterface.jump(historyJump[historyCurrent]);
                })
        } else {
            if (!jumpFlag) {
                putToHistory(selectedKeys[0]);
            }
            if (tableInterface.requestParams.filters["parentId"] !== selectedKeys[0]) {
                tableInterface.requestParams.filters["parentId"] = selectedKeys[0];
                tableInterface.refreshData();
            }
        }
    }

    const checkInput = (closeFunc) => {
        if (tableInterface.getSelectedRows().length > 0) {
            let characterCode;
            const rec = tableInterface.getSelectedRecords().map(value => {
                if (!value.requestPosCount || value.requestPosCount <= 0) {
                    characterCode = value.characterCode;
                }
                const newValue = {
                    characterCode: value.characterCode,
                    characterId: value.characterId,
                    requestPosCount: value.requestPosCount,
                    requestPosOrder: 1,
                    requestPosRemains: value.requestPosRemains,
                    originalPos: undefined,
                    requestPlanPosCount: undefined,
                    sgood: {
                        value: value.sgoodId,
                        title: value.sgoodName,
                        additional: {
                            characterId: value.characterId,
                            characterCode: value.characterCode,
                            price: value.sgoodPrice,
                            points: value.points,
                            edizmNotation: value.edizmNotation,
                            weight: value.sgoodWeightGross,
                            packageQuantity: value.packageQuantity,
                            sgoodFasFlag: value.sgoodFasFlag,
                            requestPosRemains: value.requestPosRemains,
                        }
                    }
                }
                return newValue;
            });
            if (characterCode) {
                notification.error({ message: "Для товара с характеристикой " + characterCode + " не указано количество" });
                return;
            }
            // Выведем сообщение с подтверждением редактирования
            const sgood = rec.filter(value => {
                return (allData.filter(val => val.record.characterId === value.characterId).length !== 0);
            }).map(value => value.characterCode);
            const callback = () => {
                finalyCB(true, rec);
                closeFunc();
            }
            if (sgood.length !== 0) {
                confirm(format("Товары по характеристикам {0} уже включены в позиции. Будет увеличено количество данных товаров. Продолжить?",
                    sgood.join(", ")), callback)
            } else {
                callback();
            }
            return;
        }
        notification.error({
            message: "Необходимо выбрать хотя бы один товар"
        })
    }

    const handleHistoryBack = () => {
        if (historyCurrent > 0) {
            historyCurrent--
            treeInterface.jump(historyJump[historyCurrent]);
        }
    }

    const handleHistoryNext = () => {
        if (historyCurrent < historyJump.length - 1) {
            historyCurrent++
            treeInterface.jump(historyJump[historyCurrent]);
        }
    }

    const putToHistory = (recordId) => {
        if (historyCurrent < historyJump.length - 1) {
            historyJump.splice(historyCurrent + 1, historyJump.length, recordId);
        } else {
            historyJump.push(recordId);
        }
        historyCurrent = historyJump.length - 1;
    }

    const handleSearchTree = (ev) => {
        const { value } = ev.target;
        treeInterface.search(value);
    }


    const resetSearchFilter = () => {
        tableInterface.requestParams.search = '';
        tableInterface.refreshData();
    }

    const debounceRefreshData = debounce((val) => {
        tableInterface.requestParams.search = val;
        tableInterface.refreshData();
    }, DEBOUNCE_TIMEOUT);

    const handleSearchSGood = (ev) => {
        const { value } = ev.target;
        if (value && value.length > 3) {
            debounceRefreshData(value);
        } else {
            if (value == '') {
                resetSearchFilter()
            }
        }
    }

    Modal.confirm({
        centered: true,
        title: 'Добавление группы товаров',
        width: "95%",
        content: (
            <div style={{ height: "580px" }}>
                <SplitterLayout primaryIndex={1} secondaryInitialSize={250}>
                    <div>
                        <Space style={{ padding: 8 }}>
                            <Button
                                icon={<ArrowLeftOutlined />}
                                className="back-button"
                                onClick={handleHistoryBack}
                            />
                            <Button
                                icon={<ArrowRightOutlined />}
                                className="back-button"
                                onClick={handleHistoryNext}
                            />
                            <Input.Search allowClear onChange={handleSearchTree} />
                        </Space>
                        <DataTree.SGood
                            interface={treeInterface}
                            onChange={handleSelect}
                            height={520}
                            style={{ paddingTop: 8 }} />
                    </div>
                    <div>
                        <Space style={{ padding: 8, width: "100%", justifyContent: "flex-end" }}>
                            <Input.Search allowClear onChange={handleSearchSGood} />
                        </Space>
                        <DataTable className="mod-main-table"
                            selectType="checkbox"
                            editable={false}
                            uri={{
                                forSelect: "refbooks/sgood/sgoodprice/getlist"
                            }}
                            onBeforeRefresh={() => {
                                tableInterface.requestParams.filters = Object.assign(tableInterface.requestParams.filters, params);
                                return true;
                            }}
                            autoRefresh={false}
                            columns={getColumns()}
                            interface={tableInterface}
                            idName={"priceId"}
                        />

                    </div>
                </SplitterLayout>
            </div>
        ),
        onOk: (closeFunc) => checkInput(closeFunc),
        onCancel: () => finalyCB(false),
        okText: "Добавить"
    });

}

