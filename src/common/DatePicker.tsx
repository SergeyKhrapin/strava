import IconButton from "@mui/material/IconButton"
import { type SxProps } from "@mui/material/styles"
import ClearIcon from '@mui/icons-material/Clear'
import { DatePicker as MuiDatePicker } from "@mui/x-date-pickers/DatePicker"
import dayjs, { type Dayjs } from "dayjs"
import Stack from "@mui/material/Stack"

interface IDatePicker {
  value: Dayjs | null
  setValue: React.Dispatch<React.SetStateAction<dayjs.Dayjs | null>>
  label: string
  sxProps?: SxProps
  disableFuture?: boolean
  withClearButton?: boolean
}

export const DatePicker = (props: IDatePicker) => {
  const { value, setValue, label, sxProps, disableFuture = false, withClearButton = true, ...rest } = props

  const ClearButton = () => {
    return (
      <IconButton
        onClick={(e) => {
          e.stopPropagation()
          setValue(null)
        }}
        sx={{
          width: '24px',
          height: '24px'
        }}
        aria-label="clear"
        size="small"
      >
        <ClearIcon sx={{
          width: '90%',
          height: '90%'
        }}/>
      </IconButton>
    )
  }

  return (
    <MuiDatePicker
      value={value}
      onChange={(val) => {
        setValue(val)
      }}
      label={label}
      sx={{
        width: '180px',
        // '&:after': {
        //   content: '""',
        //   position: 'absolute',
        //   top: 0,
        //   bottom: 0,
        //   right: 0,
        //   left: 0,
        //   zIndex: 999
        // },
        '& .MuiPickersInputBase-root': {
          height: '36px',
        },
        '& .MuiFormLabel-root': {
          top: '-10px'
        },
        ...sxProps
      }}
      slots={{
        inputAdornment: ({children}) => (
          <Stack sx={{
            flexDirection: 'row',
            alignItems: 'center'
          }}>
            {withClearButton && value ? <ClearButton /> : null}
            {children}
          </Stack>
        )
      }}
      minDate={dayjs('2009-01-01')}
      disableFuture={disableFuture}
      {...rest}
    />
  )
}