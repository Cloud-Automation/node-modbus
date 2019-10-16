// tslint:disable:no-shadowed-variable
import ModbusAbstractRequest from './abstract-request'
import ModbusAbstractResponse from './abstract-response'
import {
  ModbusRequestBody,
  ReadCoilsRequestBody,
  ReadDiscreteInputsRequestBody,
  ReadHoldingRegistersRequestBody,
  ReadInputRegistersRequestBody,
  WriteMultipleCoilsRequestBody,
  WriteMultipleRegistersRequestBody,
  WriteSingleCoilRequestBody,
  WriteSingleRegisterRequestBody
} from './request'
import {
  ModbusResponseBody,
  ReadCoilsResponseBody,
  ReadDiscreteInputsResponseBody,
  ReadHoldingRegistersResponseBody,
  ReadInputRegistersResponseBody,
  WriteMultipleCoilsResponseBody,
  WriteMultipleRegistersResponseBody,
  WriteSingleCoilResponseBody,
  WriteSingleRegisterResponseBody
} from './response'
import ModbusRTURequest from './rtu-request'
import ModbusRTUResponse from './rtu-response'
import ModbusTCPRequest from './tcp-request'
import ModbusTCPResponse from './tcp-response'

export type BodyRequestToResponse<T> =
  T extends ReadCoilsRequestBody ? ReadCoilsResponseBody :
  T extends ReadDiscreteInputsRequestBody ? ReadDiscreteInputsResponseBody :
  T extends ReadHoldingRegistersRequestBody ? ReadHoldingRegistersResponseBody :
  T extends ReadInputRegistersRequestBody ? ReadInputRegistersResponseBody :
  T extends WriteMultipleCoilsRequestBody ? WriteMultipleCoilsResponseBody :
  T extends WriteMultipleRegistersRequestBody ? WriteMultipleRegistersResponseBody :
  T extends WriteSingleCoilRequestBody ? WriteSingleCoilResponseBody :
  T extends WriteSingleRegisterRequestBody ? WriteSingleRegisterResponseBody :
  T extends ModbusRequestBody ? ModbusResponseBody : unknown

export type BodyResponseToRequest<T> =
  T extends ReadCoilsResponseBody ? ReadCoilsRequestBody :
  T extends ReadDiscreteInputsResponseBody ? ReadDiscreteInputsRequestBody :
  T extends ReadHoldingRegistersResponseBody ? ReadHoldingRegistersRequestBody :
  T extends ReadInputRegistersResponseBody ? ReadInputRegistersRequestBody :
  T extends WriteMultipleCoilsResponseBody ? WriteMultipleCoilsRequestBody :
  T extends WriteMultipleRegistersResponseBody ? WriteMultipleRegistersRequestBody :
  T extends WriteSingleCoilResponseBody ? WriteSingleCoilRequestBody :
  T extends WriteSingleRegisterResponseBody ? WriteSingleRegisterRequestBody :
  T extends ModbusResponseBody ? ModbusRequestBody : unknown

export type RequestToResponse<T> =
  T extends ModbusTCPRequest<infer B> ? ModbusTCPResponse<BodyRequestToResponse<B>> :
  T extends ModbusRTURequest<infer B> ? ModbusRTUResponse<BodyRequestToResponse<B>> :
  T extends ModbusAbstractRequest<infer B> ? ModbusAbstractResponse<BodyRequestToResponse<B>> :
  unknown

export type GetBody<T> =
  T extends ModbusAbstractRequest<infer B> ? B :
  T extends ModbusAbstractResponse<infer B> ? B :
  unknown

export type CastRequestBody<T extends ModbusAbstractRequest, B extends ModbusRequestBody> =
  T extends ModbusTCPRequest ? ModbusTCPRequest<B> :
  T extends ModbusRTURequest ? ModbusRTURequest<B> :
  T extends ModbusAbstractRequest ? ModbusAbstractRequest<B> :
  unknown
