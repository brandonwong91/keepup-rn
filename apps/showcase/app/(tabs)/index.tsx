import * as React from 'react';
import { Platform, View } from 'react-native';
import { ChevronsDownUp, ChevronsUpDown } from '~/components/Icons';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Text } from '~/components/ui/text';
import { cn } from '~/lib/utils';
import { Form, FormCheckbox, FormField, FormInput } from '~/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import Animated, { LinearTransition } from 'react-native-reanimated';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '~/components/ui/collapsible';
import {
  Check,
  GripVerticalIcon,
  ListTodoIcon,
  PlusIcon,
  Trash2Icon,
  XIcon,
} from 'lucide-react-native';
import { Toggle } from '~/components/ui/toggle';
import { Separator } from '~/components/ui/separator';
import { Checkbox } from '~/components/ui/checkbox';
import { FlashList } from '@shopify/flash-list';
import { useScrollToTop } from '@react-navigation/native';

const formSchema = z.object({
  title: z.string(),
  item: z.string(),
  checked: z.boolean(),
});

interface Item {
  id: string;
  value: string;
  checked: boolean;
}

interface TitleList {
  id: string;
  title: string;
  items: Item[];
}

export default function HomeScreen() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      item: '',
    },
  });
  const [open, setOpen] = React.useState(false);
  const [showList, setShowList] = React.useState(false);
  const [list, setList] = React.useState<Item[]>([]);
  const [titleList, setTitleList] = React.useState<TitleList[]>([]);
  const [editId, setEditId] = React.useState('');

  const handleEnterKeydown = (e: any) => {
    if (e.key === 'Enter') {
      const newItem: Item = {
        id: Date.now().toString(),
        value: form.getValues('item'),
        checked: form.getValues('checked'),
      };
      setList([...list, newItem]);
      form.resetField('item');
    }
  };
  const handleOnBlurItem = () => {
    if (form.getValues('item')) {
      const newItem: Item = {
        id: Date.now().toString(),
        value: form.getValues('item'),
        checked: form.getValues('checked'),
      };
      setList([...list, newItem]);
      form.resetField('item');
    }
  };

  const handleOnChange = (id: string, val: string) => {
    const updatedList = list.map((item) => {
      if (item.id === id) {
        return { ...item, value: val };
      }
      return item;
    });
    setList(updatedList);
  };

  const handleOnCheck = (id: string) => {
    const updatedList = list.map((item) => {
      if (item.id === id) {
        return { ...item, checked: !item.checked };
      }
      return item;
    });
    setList(updatedList);
  };

  const handleClearItem = () => {
    form.setValue('item', '');
  };

  const removeItem = (id: string) => {
    // Filter out the item with the given ID
    const updatedList = list.filter((item) => item.id !== id);
    // Update the state with the updated list
    setList(updatedList);
  };

  const submitTitleList = () => {
    if (editId !== '') {
      const updatedTitleList = titleList.map((titleList) => {
        if (titleList.id === editId) {
          return { ...titleList, title: form.getValues('title'), items: list };
        }
        return titleList;
      });
      setTitleList(updatedTitleList);
      setEditId('');
    } else {
      const newTitleList: TitleList = {
        id: Date.now().toString(),
        title: form.getValues('title'),
        items: list,
      };
      setTitleList([...titleList, newTitleList]);
    }
    setList([]);
    form.reset();
  };

  const handleQuickEnterKeyDown = (e) => {
    if (e.key === 'Enter' && !showList && form.getValues('title')) {
      if (editId) {
        const updatedTitleList = titleList.map((titleList) => {
          if (titleList.id === editId) {
            return { ...titleList, title: form.getValues('title'), items: list };
          }
          return titleList;
        });
        setTitleList(updatedTitleList);
        setEditId('');
      } else {
        const newTitleList: TitleList = {
          id: Date.now().toString(),
          title: form.getValues('title'),
          items: list,
        };
        setTitleList([...titleList, newTitleList]);
      }

      form.reset();
    }
  };

  const setEditTitleList = (titleList: TitleList) => {
    form.setValue('title', titleList.title);
    setList(titleList.items);
    setEditId(titleList.id);
  };

  const removeTitleList = (id: string) => {
    const updatedTitleList = titleList.filter((titleList) => titleList.id !== id);
    setTitleList(updatedTitleList);
  };

  const ref = React.useRef(null);
  useScrollToTop(ref);

  const handleCheckTitleListItem = (checked: boolean, id: string, itemId: string) => {
    const updatedTitleList = titleList.map((titleList) => {
      if (titleList.id === id) {
        const updatedItems = titleList.items.map((item) => {
          if (item.id === itemId) {
            return { ...item, checked };
          }
          return item;
        });
        return { ...titleList, items: updatedItems };
      }
      return titleList;
    });
    setTitleList(updatedTitleList);
  };

  return (
    <View className='flex-1 p-6 justify-center gap-6'>
      <Form {...form}>
        <View className='max-w-lg mx-auto'>
          <Card className={cn('p-6', { 'border-0 shadow-none': !open })}>
            <Collapsible asChild open={open} onOpenChange={setOpen}>
              <Animated.View layout={Platform.OS !== 'web' ? LinearTransition : undefined}>
                <View className='w-full gap-4'>
                  <View
                    className={cn('flex flex-row gap-3', {
                      'justify-end': showList || list.length > 0,
                    })}
                  >
                    <View>
                      <FormField
                        name='title'
                        render={({ field }) => (
                          <FormInput
                            placeholder='Add note...'
                            autoCapitalize='none'
                            {...field}
                            onKeyPress={handleQuickEnterKeyDown}
                          />
                        )}
                      />
                    </View>

                    <CollapsibleTrigger asChild>
                      <Button variant='ghost' size='icon'>
                        {open ? (
                          <ChevronsDownUp size={16} className='text-foreground' />
                        ) : (
                          <ChevronsUpDown size={16} className='text-foreground' />
                        )}
                        <Text className='sr-only'>Toggle</Text>
                      </Button>
                    </CollapsibleTrigger>
                  </View>
                  <CollapsibleContent className='gap-3'>
                    {showList && (
                      <View className='flex flex-row gap-3 items-center'>
                        {showList && <GripVerticalIcon size={16} className='text-foreground' />}
                        {showList && form.getValues('item') ? (
                          <FormField
                            control={form.control}
                            name='checked'
                            render={({ field }) => <FormCheckbox {...field}></FormCheckbox>}
                          />
                        ) : (
                          <PlusIcon size={24} className='text-foreground' />
                        )}
                        <FormField
                          name='item'
                          render={({ field }) => (
                            <FormInput
                              placeholder='Add item...'
                              autoCapitalize='none'
                              {...field}
                              onKeyPress={handleEnterKeydown}
                              onBlur={handleOnBlurItem}
                            />
                          )}
                        />
                        {showList && (
                          <Button
                            variant='ghost'
                            size='icon'
                            onPress={handleClearItem}
                            className='bg-red-300 dark:bg-red-700'
                          >
                            <XIcon size={16} className='text-foreground' />
                          </Button>
                        )}
                      </View>
                    )}

                    {list.length > 0 &&
                      list.map((item) => {
                        return (
                          <View className='flex flex-row gap-3 items-center' key={`${item.id}`}>
                            <GripVerticalIcon size={16} className='text-foreground' />
                            <FormCheckbox
                              value={item.checked}
                              onBlur={function (): void {
                                throw new Error('Function not implemented.');
                              }}
                              onChange={() => handleOnCheck(item.id)}
                              name={''}
                            />

                            <FormInput
                              placeholder='Add description...'
                              autoCapitalize='none'
                              className='w-full'
                              value={item.value}
                              name={''}
                              onBlur={() => {}}
                              onChange={(val) => handleOnChange(item.id, val)}
                            />
                            <Button
                              variant='ghost'
                              size='icon'
                              onPress={() => removeItem(item.id)}
                              className='bg-red-300 dark:bg-red-700'
                            >
                              <Trash2Icon size={16} className='text-foreground' />
                            </Button>
                          </View>
                        );
                      })}
                    <Separator className='my-1' />
                    <View className='flex flex-row justify-between'>
                      <Toggle
                        aria-label='Toggle showList'
                        pressed={showList}
                        onPressedChange={() => {
                          setShowList((prev) => !prev);
                        }}
                      >
                        <ListTodoIcon size={16} className='text-foreground' />
                      </Toggle>
                      <Button variant='ghost' size='icon' onPress={submitTitleList}>
                        <Check size={16} className='text-foreground' />
                      </Button>
                    </View>
                  </CollapsibleContent>
                </View>
              </Animated.View>
            </Collapsible>
          </Card>
        </View>
      </Form>

      <FlashList
        ref={ref}
        data={titleList}
        className='native:overflow-hidden gap-y-2'
        estimatedItemSize={20}
        showsVerticalScrollIndicator={true}
        renderItem={({ item }) => {
          const { id: titleListId, items, title } = item;
          return (
            <View key={titleListId} className='py-2'>
              <Card>
                <CardHeader>
                  <View className='flex flex-row justify-between'>
                    <CardTitle className='pt-1' onPress={() => setEditTitleList(item)}>
                      {title || <p className='italic'>Untitled note</p>}
                    </CardTitle>
                    <Button
                      variant='ghost'
                      size='icon'
                      onPress={() => removeTitleList(titleListId)}
                      className='bg-red-300 dark:bg-red-700'
                    >
                      <Trash2Icon size={16} className='text-foreground' />
                    </Button>
                  </View>
                </CardHeader>
                <CardContent>
                  {items.length > 0 &&
                    items.map(({ id: itemId, value, checked }) => (
                      <View
                        key={itemId}
                        className='gap-8 flex flex-row items-center text-foreground'
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(checked: boolean) =>
                            handleCheckTitleListItem(checked, titleListId, itemId)
                          }
                        />
                        <p>{value}</p>
                      </View>
                    ))}
                </CardContent>
              </Card>
            </View>
          );
        }}
        ListFooterComponent={<View className='py-4' />}
      />
    </View>
  );
}
