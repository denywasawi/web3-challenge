"use client";

import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import { useState } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  address?: string;
  setAddress?: (val: string) => void;
}

export default function ModalAddress(props: Readonly<Props>) {
  const { isOpen, onClose, address, setAddress } = props;

  const [tempAddress, setTempAddress] = useState<string>(address ?? "");

  const handleAddAddress = () => {
    setAddress?.(tempAddress);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>Add wallet address:</ModalHeader>
        <ModalBody>
          <Input
            type="text"
            value={tempAddress}
            onValueChange={setTempAddress}
          />
        </ModalBody>
        <ModalFooter>
          <Button color="default" variant="light" onPress={onClose}>
            Close
          </Button>
          <Button color="primary" onPress={handleAddAddress}>
            Add
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
