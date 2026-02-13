'use client'
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react'
import { useEffect } from 'react'
import Icon from './Icon';
import { style } from 'framer-motion/client';

const Modal = ({
    isOpen,
    onClose,
    children,
    heading,
}) => {
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    return (
        <Dialog open={isOpen} onClose={() => { }} className="relative z-10">
            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex items-end justify-center text-center sm:items-center sm:p-0">
                    <DialogPanel
                        transition
                        className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in lg:max-w-4xl sm:my-8 sm:w-full sm:max-w-lg data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
                    >
                        {/* Header with blue background */}
                        <div className="flex justify-between items-center bg-blue-500 text-white px-4">
                            <div className='text-md font-semibold'>
                                {heading}
                            </div>
                            <div className='mt-2'>
                                <button
                                    onClick={onClose}
                                    className="bg-red-400 text-black rounded-full hover:bg-opacity-90"
                                >
                                    <Icon name="RiCloseLine" size={20} color="white" />
                                </button>
                            </div>

                        </div>

                        <div className={`bg-white ${style}`}>
                            {children}
                        </div>
                    </DialogPanel>
                </div>
            </div>

            <DialogBackdrop
                transition
                className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
            />
        </Dialog>
    )
}

export default Modal;
