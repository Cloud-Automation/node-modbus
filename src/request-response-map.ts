import {
  ReadCoilsRequestBody,
  ReadDiscreteInputsRequestBody,
  ReadHoldingRegistersRequestBody,
  ReadInputRegistersRequestBody,
  WriteMultipleCoilsRequestBody,
  WriteMultipleRegistersRequestBody,
  WriteSingleCoilRequestBody,
  WriteSingleRegisterRequestBody,
  ModbusRequestBody,
} from "./request";
import {
  ReadCoilsResponseBody,
  ReadDiscreteInputsResponseBody,
  ReadHoldingRegistersResponseBody,
  ReadInputRegistersResponseBody,
  WriteMultipleCoilsResponseBody,
  WriteMultipleRegistersResponseBody,
  WriteSingleCoilResponseBody,
  WriteSingleRegisterResponseBody,
  ModbusResponseBody,
} from "./response";


export type RequestToResponse<T> =
  T extends ReadCoilsRequestBody ? ReadCoilsResponseBody :
  T extends ReadDiscreteInputsRequestBody ? ReadDiscreteInputsResponseBody :
  T extends ReadHoldingRegistersRequestBody ? ReadHoldingRegistersResponseBody :
  T extends ReadInputRegistersRequestBody ? ReadInputRegistersResponseBody :
  T extends WriteMultipleCoilsRequestBody ? WriteMultipleCoilsResponseBody :
  T extends WriteMultipleRegistersRequestBody ? WriteMultipleRegistersResponseBody :
  T extends WriteSingleCoilRequestBody ? WriteSingleCoilResponseBody :
  T extends WriteSingleRegisterRequestBody ? WriteSingleRegisterResponseBody :
  T extends ModbusRequestBody ? ModbusResponseBody : unknown;


export type ResponseToRequest<T> =
  T extends ReadCoilsResponseBody ? ReadCoilsRequestBody :
  T extends ReadDiscreteInputsResponseBody ? ReadDiscreteInputsRequestBody :
  T extends ReadHoldingRegistersResponseBody ? ReadHoldingRegistersRequestBody :
  T extends ReadInputRegistersResponseBody ? ReadInputRegistersRequestBody :
  T extends WriteMultipleCoilsResponseBody ? WriteMultipleCoilsRequestBody :
  T extends WriteMultipleRegistersResponseBody ? WriteMultipleRegistersRequestBody :
  T extends WriteSingleCoilResponseBody ? WriteSingleCoilRequestBody :
  T extends WriteSingleRegisterResponseBody ? WriteSingleRegisterRequestBody :
  T extends ModbusResponseBody ? ModbusRequestBody : unknown;
