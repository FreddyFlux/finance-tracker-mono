import React from 'react'
import { Dimensions, Modal, Pressable, View } from 'react-native'

export interface PopoverProps {
  trigger: React.ReactNode
  children: React.ReactNode
  onOpen?: () => void
  onClose?: () => void
}

export function Popover({ trigger, children, onOpen, onClose }: PopoverProps) {
  const [visible, setVisible] = React.useState(false)
  const [position, setPosition] = React.useState({ x: 0, y: 0, width: 0, height: 0 })
  const triggerRef = React.useRef<View>(null)

  const open = () => {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setPosition({ x, y, width, height })
      setVisible(true)
      onOpen?.()
    })
  }

  const close = () => {
    setVisible(false)
    onClose?.()
  }

  const { width: screenWidth, height: screenHeight } = Dimensions.get('window')
  const popoverWidth = 180
  const popoverHeight = 80
  const popoverX = Math.min(
    Math.max(position.x + position.width / 2 - popoverWidth / 2, 16),
    screenWidth - popoverWidth - 16,
  )
  const popoverTop = Math.max(position.y - popoverHeight - 8, 16)

  return (
    <>
      <Pressable ref={triggerRef} onPress={open}>
        {trigger}
      </Pressable>
      <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
        <Pressable className="flex-1" onPress={close}>
          <View
            className="absolute rounded-lg border border-gray-200 bg-white p-2 shadow-md"
            style={{
              top: popoverTop,
              left: popoverX,
              width: popoverWidth,
            }}
          >
            <Pressable onPress={(e) => e.stopPropagation()}>{children}</Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  )
}
