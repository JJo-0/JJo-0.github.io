#ifndef SOC00_SENSOR_REGS_H
#define SOC00_SENSOR_REGS_H

/* Educational offsets only. Not a Linux/Zephyr driver API. */
#define SENSOR_CTRL_OFFSET        0x00u
#define SENSOR_STATUS_OFFSET      0x04u
#define SENSOR_DATA_OFFSET        0x08u
#define SENSOR_IRQ_ENABLE_OFFSET  0x0Cu
#define SENSOR_IRQ_STATE_OFFSET   0x10u

#define SENSOR_CTRL_ENABLE        (1u << 0)

#define SENSOR_STATUS_EMPTY       (1u << 0)
#define SENSOR_STATUS_FULL        (1u << 1)
#define SENSOR_STATUS_LEVEL_SHIFT 8u
#define SENSOR_STATUS_LEVEL_MASK  (0x1Fu << SENSOR_STATUS_LEVEL_SHIFT)

#define SENSOR_IRQ_DATA_READY     (1u << 0)
#define SENSOR_IRQ_OVERFLOW       (1u << 1)

#endif
