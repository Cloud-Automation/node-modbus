const UINT16_MIN = 0x0000
const UINT16_MAX = 0xFFFF
const REGISTER_MAX = UINT16_MAX
const REGISTER_MIN = UINT16_MIN

const COIL_MIN = 0x00
const COIL_MAX = 0x01

const ERROR_CODE_THRESHOLD = 0x80

/* The size of the Modbus PDU is limited to 253 bytes. The constraint comes from the
 * first Modbus implementation on serial line, where the maximum RTU ADU is 256 bytes:
 * 256 - 1 byte server address - 2 bytes CRC = 253. See Modbus Application Protocol V1.1b3, section 4.1
 */
const PDU_MAX = 253

/* Address (1) + PDU (253) + CRC (2) */
const RTU_ADU_MAX = 256

/* MBAP header (7) + PDU (253) */
const TCP_ADU_MAX = 260

export const LIMITS = {
  COIL_MAX,
  COIL_MIN,
  ERROR_CODE_THRESHOLD,
  PDU_MAX,
  REGISTER_MAX,
  REGISTER_MIN,
  RTU_ADU_MAX,
  TCP_ADU_MAX,
  UINT16_MAX,
  UINT16_MIN
} as const
